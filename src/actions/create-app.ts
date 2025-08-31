"use server";

import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { doc, getDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";

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
  const profile = profileSnap.data();

  if (!profile) {
    throw new Error("User profile not found");
  }

  // Check if user has freestyleIdentity
  if (!profile.freestyleIdentity) {
    console.error("User profile missing freestyleIdentity:", userId);
    throw new Error("User identity not found. Please refresh the page and try again.");
  }

  console.log("Using freestyleIdentity:", profile.freestyleIdentity);
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
  
  console.log("Repository created:", repo.repoId);
  
  await freestyle.grantGitPermission({
    identityId: profile.freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  console.log("Git permission granted");

  const token = await freestyle.createGitAccessToken({
    identityId: profile.freestyleIdentity,
  });

  console.log("Git access token created");
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

  // Note: Memory thread creation and initial message sending are temporarily disabled
  // to avoid 500 errors from the memory system dependencies
  // The memory system will be initialized when the user first visits the app page
  console.log("App created successfully:", {
    appId: app.id,
    gitRepo: repo.repoId,
    initialMessage: initialMessage || "No initial message",
    mcpEphemeralUrl
  });

  return app;
}
