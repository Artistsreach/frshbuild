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
import { MessageList } from "@mastra/core/agent";
import { getUser } from "@/auth/get-user";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

// Simple in-memory stream state management (replaces Redis)
const streamStates = new Map<string, string>();

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

  const streamState = streamStates.get(appId);

  if (streamState === "running") {
    console.log("Stopping previous stream for appId:", appId);
    stopStream(appId);

    // Wait until stream state is cleared
    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedState = streamStates.get(appId);
      if (updatedState !== "running") {
        break;
      }
      attempts++;
    }

    // If stream is still running after max attempts, return an error
    if (attempts >= maxAttempts) {
      streamStates.delete(appId);
      return new Response(
        "Previous stream is still shutting down, please try again",
        { status: 429 }
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Simplified auto-resume logic without Redis
  const needsResume = false; // Disabled for now to simplify the system

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
  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: {
      dev_server: {
        url: new URL(mcpUrl),
      },
    },
  });

  const toolsets = await mcp.getToolsets();

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
        streamStates.set(appId, "running");
      }
    },
    async onStepFinish(step) {
      messageList.add(step.response.messages, "response");

      if (shouldAbort) {
        streamStates.delete(appId);
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
      await mcp.disconnect();
      streamStates.delete(appId);
      console.error("Error:", error);
    },
    onFinish: async () => {
      streamStates.delete(appId);
      // Simplified finish logic without Redis
      await mcp.disconnect();
    },
    abortSignal: controller.signal,
  });

  console.log("Stream created for appId:", appId, "with prompt:", message);

  return await setStream(appId, message, stream as any);
}
