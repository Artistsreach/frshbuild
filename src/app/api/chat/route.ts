import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { UIMessage } from "ai";
import { builderAgent } from "@/mastra/agents/builder";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import {
  isStreamRunning,
  stopStream,
  waitForStreamToStop,
  clearStreamState,
  sendMessageWithStreaming,
} from "@/lib/internal/stream-manager";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest } from "next/server";
import { getUser } from "@/auth/get-user";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";

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

  const user = await getUser();
  if (!user) {
    return new Response("User not found", { status: 401 });
  }

  // Check if user has access to this app
  const userApp = await db
    .select()
    .from(appUsers)
    .where(and(eq(appUsers.appId, appId), eq(appUsers.userId, user.uid)))
    .limit(1);

  if (userApp.length === 0) {
    return new Response("Access denied", { status: 403 });
  }

  // Check credits (simplified - you can enhance this)
  const profileRef = doc(firestoreDb, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  const profile = profileSnap.data();

  let credits = profile?.credits as number | undefined;
  if (credits === undefined) {
    credits = 100; // Default credits
  }

  if (credits < 10) {
    return new Response("Not enough credits", { status: 402 });
  }

  // Deduct credits
  await updateDoc(profileRef, {
    credits: credits - 10,
  });

  // Check if a stream is already running and stop it if necessary
  if (await isStreamRunning(appId)) {
    console.log("Stopping previous stream for appId:", appId);
    await stopStream(appId);

    // Wait until stream state is cleared
    const stopped = await waitForStreamToStop(appId);
    if (!stopped) {
      await clearStreamState(appId);
      return new Response(
        "Previous stream is still shutting down, please try again",
        { status: 429 }
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    const { mcpEphemeralUrl } = await freestyle.requestDevServer({
      repoId: app.info.gitRepo,
    });

    const resumableStream = await sendMessageWithStreaming(
      builderAgent,
      appId,
      mcpEphemeralUrl,
      null, // fs parameter not needed for our setup
      messages.at(-1)!
    );

    return resumableStream.response();
  } catch (error) {
    console.error("Error creating chat stream:", error);
    
    // Refund credits on error
    await updateDoc(profileRef, {
      credits: credits,
    });
    
    return new Response(
      "Failed to create chat stream: " + (error instanceof Error ? error.message : "Unknown error"),
      { status: 500 }
    );
  }
}
