"use server";

import { sendMessage } from "@/app/api/chat/route";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";

export async function createApp({
  initialMessage,
  templateId,
  userId,
  freestyleIdentity,
}: {
  initialMessage?: string;
  templateId: string;
  userId: string;
  freestyleIdentity: string;
}) {
  console.time("validate inputs");
  
  if (!freestyleIdentity) {
    throw new Error("FreestyleIdentity is required");
  }

  console.log("Using freestyleIdentity:", freestyleIdentity);
  console.timeEnd("validate inputs");

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

  // Generate a proper app name
  const appName = initialMessage?.trim() || "Unnamed App";
  const appDescription = initialMessage?.trim() || "No description";

  console.time("git");
  const repo = await freestyle.createGitRepository({
    name: appName,
    public: true,
    source: {
      type: "git",
      url: templates[templateId].repo,
    },
  });
  
  console.log("Repository created:", repo.repoId);
  
  await freestyle.grantGitPermission({
    identityId: freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  console.log("Git permission granted");

  const token = await freestyle.createGitAccessToken({
    identityId: freestyleIdentity,
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
        name: appName,
        description: appDescription,
        is_public: false, // Start as private by default
        is_recreatable: false, // Start as not recreatable by default
        requires_subscription: false, // Start as free by default
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
        freestyleIdentity: freestyleIdentity,
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
