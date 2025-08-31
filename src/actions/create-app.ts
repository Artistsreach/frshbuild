"use server";

import { sendMessage } from "@/app/api/chat/route";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";

export async function createApp({
  initialMessage,
  templateId,
  userId,
}: {
  initialMessage?: string;
  templateId: string;
  userId: string;
}) {
  console.time("get user profile");
  
  // Get user profile from Firestore using the provided userId
  const profileRef = doc(firestoreDb, "profiles", userId);
  const profileSnap = await getDoc(profileRef);
  let profile = profileSnap.data();

  if (!profile) {
    throw new Error("User profile not found");
  }

  // If user doesn't have a freestyleIdentity, create one
  if (!profile.freestyleIdentity) {
    console.log("Creating freestyleIdentity for user:", userId);
    try {
      const identity = await freestyle.createIdentity({
        name: profile.displayName || profile.email || "User",
        email: profile.email,
      });
      
      // Update the profile with the new freestyleIdentity
      await setDoc(profileRef, { freestyleIdentity: identity.identityId }, { merge: true });
      profile = { ...profile, freestyleIdentity: identity.identityId };
      console.log("FreestyleIdentity created:", identity.identityId);
    } catch (error) {
      console.error("Error creating freestyleIdentity:", error);
      throw new Error("Failed to create user identity");
    }
  }

  console.timeEnd("get user profile");

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

  console.time("git");
  const repo = await freestyle.createGitRepository({
    name: "Unnamed App",
    public: true,
    source: {
      type: "git",
      url: templates[templateId].repo,
    },
  });
  await freestyle.grantGitPermission({
    identityId: profile.freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  const token = await freestyle.createGitAccessToken({
    identityId: profile.freestyleIdentity,
  });

  console.timeEnd("git");

  console.time("dev server");
  const { mcpEphemeralUrl } = await freestyle.requestDevServer({
    repoId: repo.repoId,
  });
  console.timeEnd("dev server");

  const app = await db.transaction(async (tx) => {
    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: initialMessage,
        is_public: false,
        // Save the selected framework/template for downstream UI logic (e.g., Expo detection)
        baseId: templateId,
      })
      .returning();

    await tx
      .insert(appUsers)
      .values({
        appId: appInsertion[0].id,
        userId: userId,
        permissions: "admin",
        freestyleAccessToken: token.token,
        freestyleAccessTokenId: token.id,
        freestyleIdentity: profile.freestyleIdentity,
      })
      .returning();

    return appInsertion[0];
  });

  console.time("mastra: create thread");
  await memory.createThread({
    threadId: app.id,
    resourceId: app.id,
  });
  console.timeEnd("mastra: create thread");

  if (initialMessage) {
    const trimmed = initialMessage.trim();
    if (trimmed.length > 0) {
      console.time("send initial message");
      const msg = {
        id: crypto.randomUUID(),
        parts: [
          {
            text: trimmed,
            type: "text" as const,
          },
        ],
        role: "user" as const,
      };
      const maxAttempts = 3;
      let attempt = 0;
      let lastError: unknown = undefined;
      while (attempt < maxAttempts) {
        try {
          if (attempt > 0) {
            const delay = 400 * attempt; // simple backoff
            await new Promise((r) => setTimeout(r, delay));
          }
          await sendMessage(app.id, mcpEphemeralUrl, msg as any);
          lastError = undefined;
          break;
        } catch (e) {
          lastError = e;
          attempt++;
        }
      }
      console.timeEnd("send initial message");
      if (lastError) {
        console.error("Failed to send initial message after retries", lastError);
      }
    }
  }

  return app;
}
