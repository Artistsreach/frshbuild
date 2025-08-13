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
import { stackServerApp } from "@/auth/stack-auth";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  const user = await stackServerApp.getUser();
  if (!user) {
    return new Response("User not found", { status: 401 });
  }
  let credits = user.serverMetadata?.credits as number | undefined;

  if (credits === undefined) {
    credits = 100;
  }

  if (credits < 15) {
    return new Response("Not enough credits", { status: 402 });
  }

  await user.update({
    serverMetadata: {
      ...user.serverMetadata,
      credits: credits - 15,
    },
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
    maxSteps: 100,
    maxRetries: 0,
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
      await redisPublisher.del(`app:${appId}:stream-state`);
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    },
    onFinish: async () => {
      await redisPublisher.del(`app:${appId}:stream-state`);
      await mcp.disconnect();
    },
    abortSignal: controller.signal,
  });

  console.log("Stream created for appId:", appId, "with prompt:", message);

  return await setStream(appId, message, stream as any);
}
