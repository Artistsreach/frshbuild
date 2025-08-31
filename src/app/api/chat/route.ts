import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { MCPClient } from "@mastra/mcp";
import { builderAgent } from "@/mastra/agents/builder";
import { UIMessage } from "ai";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import { getAbortCallback, setStream, stopStream } from "@/lib/streams";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest } from "next/server";
import { redisPublisher } from "@/lib/redis";
import { MessageList } from "@mastra/core/agent";
import { getUser } from "@/auth/get-user";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  getFirebaseAdmin();
  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  const user = await getUser();
  if (!user) {
    return new Response("User not found", { status: 401 });
  }

  const profileRef = doc(firestoreDb, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  const profile = profileSnap.data();

  let credits = profile?.credits as number | undefined;

  if (credits === undefined) {
    credits = 100;
  }

  if (credits < 10) {
    return new Response("Not enough credits", { status: 402 });
  }

  await updateDoc(profileRef, {
    credits: credits - 10,
  });

  const streamState = await redisPublisher.get(
    "app:" + appId + ":stream-state"
  );

  if (streamState === "running") {
    console.log("Stopping previous stream for appId:", appId);
    stopStream(appId);

    // Wait until stream state is cleared
    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedState = await redisPublisher.get(
        "app:" + appId + ":stream-state"
      );
      if (updatedState !== "running") {
        break;
      }
      attempts++;
    }

    // If stream is still running after max attempts, return an error
    if (attempts >= maxAttempts) {
      await redisPublisher.del(`app:${appId}:stream-state`);
      return new Response(
        "Previous stream is still shutting down, please try again",
        { status: 429 }
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // If a previous run marked this thread to auto-resume, prepend a synthetic continue message
  const needsResume = await redisPublisher.get(`app:${appId}:needs-resume`);
  if (needsResume === "1") {
    // Limit auto-resume loops
    const attemptsRaw = await redisPublisher.get(`app:${appId}:resume-attempts`);
    const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;
    if (attempts < 2) {
      await redisPublisher.set(`app:${appId}:resume-attempts`, String(attempts + 1), { EX: 60 * 10 });
      // Clear the flag so we don't chain endlessly
      await redisPublisher.del(`app:${appId}:needs-resume`);
      messages.push({
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: "continue from where you left off. finish all remaining tasks and checklist items." }],
      } as unknown as UIMessage);
    } else {
      // Give up auto-resume after attempts threshold
      await redisPublisher.del(`app:${appId}:needs-resume`);
    }
  }

  const { mcpEphemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
  });

  const resumableStream = await sendMessage(
    appId,
    mcpEphemeralUrl,
    messages.at(-1)!
  );

  return resumableStream.response();
}

export async function sendMessage(
  appId: string,
  mcpUrl: string,
  message: UIMessage
) {
  console.log("Connecting to MCP server at:", mcpUrl);
  
  try {
    const mcp = new MCPClient({
      id: crypto.randomUUID(),
      servers: {
        dev_server: {
          url: new URL(mcpUrl),
        },
      },
    });

    console.log("MCP client created, getting toolsets...");
    const toolsets = await mcp.getToolsets();
    console.log("MCP toolsets received:", Object.keys(toolsets));

    const controller = new AbortController();
    let shouldAbort = false;
    await getAbortCallback(appId, () => {
      shouldAbort = true;
    });

    let lastKeepAlive = Date.now();

    const messageList = new MessageList({
      resourceId: appId,
      threadId: appId,
    });

    console.log("Starting builder agent stream with message:", message);
    const stream = await builderAgent.stream([message], {
      memory: {
        thread: { id: appId },
        resource: appId,
      },
      maxSteps: 200,
      maxRetries: 2,
      maxOutputTokens: 64000,
      toolsets,
      async onChunk() {
        if (Date.now() - lastKeepAlive > 5000) {
          lastKeepAlive = Date.now();
          redisPublisher.set(`app:${appId}:stream-state`, "running", {
            EX: 15,
          });
        }
      },
      async onStepFinish(step) {
        messageList.add(step.response.messages, "response");

        if (shouldAbort) {
          await redisPublisher.del(`app:${appId}:stream-state`);
          await redisPublisher.set(`app:${appId}:needs-resume`, "1", { EX: 60 * 10 });
          controller.abort("Aborted stream after step finish");
          const messages = messageList.drainUnsavedMessages();
          console.log(messages);
          const memory = await builderAgent.getMemory();
          await memory?.saveMessages({
            messages,
          });
        }
      },
      onError: async (error) => {
        console.error("Builder agent stream error:", error);
        await mcp.disconnect();
        await redisPublisher.del(`app:${appId}:stream-state`);
        await redisPublisher.set(`app:${appId}:needs-resume`, "1", { EX: 60 * 10 });
      },
      onFinish: async () => {
        console.log("Builder agent stream finished");
        await redisPublisher.del(`app:${appId}:stream-state`);
        // Mark for auto-resume if no explicit abort occurred and no recent resume attempt
        if (!shouldAbort) {
          const attemptsRaw = await redisPublisher.get(`app:${appId}:resume-attempts`);
          const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;
          if (attempts < 2) {
            await redisPublisher.set(`app:${appId}:needs-resume`, "1", { EX: 60 * 10 });
          }
        }
        await mcp.disconnect();
      },
      abortSignal: controller.signal,
    });

    console.log("Stream created for appId:", appId, "with prompt:", message);

    return await setStream(appId, message, stream as any);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}
