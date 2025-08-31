"use server";

import { getUser } from "@/auth/get-user";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { doc, getDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { freestyle } from "@/lib/freestyle";
import { eq } from "drizzle-orm";
import { memory } from "@/mastra/agents/builder";

export async function recreateApp(sourceAppId: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const profileRef = doc(firestoreDb, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  const profile = profileSnap.data();

  if (!profile) {
    throw new Error("User profile not found");
  }

  // Load source app
  const source = (
    await db.select().from(appsTable).where(eq(appsTable.id, sourceAppId)).limit(1)
  ).at(0);
  if (!source) {
    throw new Error("Source app not found");
  }

  // Create new repo by cloning from the source repo URL
  const repo = await freestyle.createGitRepository({
    name: `${source.name}`,
    public: true,
    source: {
      type: "git",
      url: `https://git.freestyle.sh/${source.gitRepo}`,
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

  // Create new app and membership
  const newApp = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: source.name,
        description: source.description,
        baseId: source.baseId,
        previewDomain: null,
        is_public: false,
      })
      .returning();

    await tx.insert(appUsers).values({
      appId: inserted[0].id,
      userId: user.uid,
      permissions: "admin",
      freestyleAccessToken: token.token,
      freestyleAccessTokenId: token.id,
      freestyleIdentity: profile.freestyleIdentity,
    });

    return inserted[0];
  });

  // Create a Mastra thread for the new app so the app page can load chat state
  await memory.createThread({
    threadId: newApp.id,
    resourceId: newApp.id,
  });

  return { appId: newApp.id } as const;
}
