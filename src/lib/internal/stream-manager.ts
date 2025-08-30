import { Agent } from "@mastra/core/agent";
import { UIMessage } from "ai";

interface StreamState {
  state: "running" | "stopped" | "error";
  error?: string;
}

interface StreamContext {
  response: () => Response;
  setResult: (result: any) => Promise<void>;
  stop: () => Promise<void>;
  onAbort: (callback: () => void) => void;
  updateKeepAlive: () => void;
}

const streams = new Map<string, StreamContext>();
const streamStates = new Map<string, StreamState>();

export async function sendMessageWithStreaming(
  agent: Agent,
  appId: string,
  mcpEphemeralUrl: string,
  fs: any,
  message: UIMessage
): Promise<StreamContext> {
  console.log("Starting stream for appId:", appId);
  
  // Set initial state
  streamStates.set(appId, { state: "running" });

  try {
    // Process the message with the agent
    const result = await agent.stream([message], {
      resourceId: appId,
      threadId: appId,
    });

    // Set the stream result
    await setStream(appId, message, result);

    // Return the stream context
    const stream = streams.get(appId);
    if (!stream) {
      throw new Error(`No stream found for appId: ${appId}`);
    }

    return stream;
  } catch (error) {
    console.error("Error in sendMessageWithStreaming:", error);
    streamStates.set(appId, { 
      state: "error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    throw error;
  }
}

export async function setStream(
  appId: string,
  message: UIMessage,
  result: any
): Promise<StreamContext> {
  const responseBody = result.toUIMessageStreamResponse().body;

  if (!responseBody) {
    throw new Error(
      "Error creating resumable stream: response body is undefined"
    );
  }

  const streamWrapper: StreamContext = {
    response() {
      return new Response(responseBody, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          connection: "keep-alive",
          "x-vercel-ai-ui-message-stream": "v1",
          "x-accel-buffering": "no",
        },
        status: 200,
      });
    },
    async setResult(result: any) {
      // Store the result for later use if needed
    },
    async stop() {
      streamStates.set(appId, { state: "stopped" });
    },
    onAbort(callback: () => void) {
      // Handle abort callback if needed
    },
    updateKeepAlive() {
      // Handle keep alive if needed
    },
  };

  streams.set(appId, streamWrapper);
  return streamWrapper;
}

export async function getStream(appId: string): Promise<StreamContext | undefined> {
  return streams.get(appId);
}

export async function getStreamState(appId: string): Promise<StreamState | undefined> {
  return streamStates.get(appId);
}

export async function isStreamRunning(appId: string): Promise<boolean> {
  const state = streamStates.get(appId);
  return state?.state === "running";
}

export async function stopStream(appId: string): Promise<void> {
  console.log("Stopping stream for appId:", appId);
  const stream = streams.get(appId);
  if (stream) {
    await stream.stop();
  }
  streamStates.set(appId, { state: "stopped" });
}

export async function waitForStreamToStop(appId: string): Promise<boolean> {
  const maxWaitTime = 5000; // 5 seconds
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const state = streamStates.get(appId);
    if (state?.state === "stopped") {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

export async function clearStreamState(appId: string): Promise<void> {
  streams.delete(appId);
  streamStates.delete(appId);
}

export async function setupAbortCallback(appId: string, callback: () => void): Promise<void> {
  const stream = streams.get(appId);
  if (stream) {
    stream.onAbort(callback);
  }
}

export async function updateKeepAlive(appId: string): Promise<void> {
  const stream = streams.get(appId);
  if (stream) {
    stream.updateKeepAlive();
  }
}

export async function handleStreamLifecycle(appId: string): Promise<void> {
  // Handle any additional stream lifecycle management
  console.log("Handling stream lifecycle for appId:", appId);
}
