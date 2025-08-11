"use server";

import { getApp } from "@/actions/get-app";
import AppWrapper from "../../../components/app-wrapper";
import { freestyle } from "@/lib/freestyle";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/actions/get-user";
import { memory } from "@/mastra/agents/builder";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/dist/client/link";
import { chatState } from "@/actions/chat-streaming";
import { RecreateButton } from "@/components/recreate-button";

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;

  // Fetch the app first to determine if it's public
  const app = await getApp(id).catch(() => undefined);

  if (!app) {
    return <ProjectNotFound />;
  }

  // If the app is not public, require authentication and membership
  if (!app.info.is_public) {
    const user = await getUser();
    if (!user) {
      return <ProjectNotFound />;
    }

    const userPermission = (
      await db
        .select()
        .from(appUsers)
        .where(and(eq(appUsers.userId, user.id), eq(appUsers.appId, id)))
        .limit(1)
    ).at(0);

    if (!userPermission?.permissions) {
      return <ProjectNotFound />;
    }
  }

  if (app.info.requires_subscription) {
    const user = await getUser();
    if (!user) {
      return <SubscriptionRequired />;
    }
    const userPermission = (
      await db
        .select()
        .from(appUsers)
        .where(and(eq(appUsers.userId, user.id), eq(appUsers.appId, id)))
        .limit(1)
    ).at(0);

    if (!userPermission) {
      return <SubscriptionRequired />;
    }
  }

  // Determine if the current viewer is a member to conditionally show "Recreate"
  let isOwner = false;
  const user = await getUser();
  if (user) {
    try {
      const membership = (
        await db
          .select()
          .from(appUsers)
          .where(and(eq(appUsers.userId, user.id), eq(appUsers.appId, id)))
          .limit(1)
      ).at(0);
      isOwner = !!membership;
    } catch {
      // Not logged in; so not the owner
      isOwner = false;
    }
  }

  const showRecreate = app.info.is_recreatable && !isOwner;

  const { uiMessages } = await memory.query({
    threadId: id,
    resourceId: id,
  });

  // Request dev server with a brief retry to avoid SSR crash right after recreation
  let codeServerUrl = "";
  let ephemeralUrl = "";
  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  try {
    const res = await freestyle.requestDevServer({ repoId: app?.info.gitRepo });
    codeServerUrl = res.codeServerUrl;
    ephemeralUrl = res.ephemeralUrl;
  } catch (e1) {
    try {
      await sleep(1000);
      const res2 = await freestyle.requestDevServer({ repoId: app?.info.gitRepo });
      codeServerUrl = res2.codeServerUrl;
      ephemeralUrl = res2.ephemeralUrl;
    } catch (e2) {
      console.error("Dev server request failed twice for app", app?.info.id, e2);
      // Allow page to render; client WebView can recover/request later
      codeServerUrl = "";
      ephemeralUrl = "";
    }
  }

  console.log("requested dev server");

  // Use the previewDomain from the database, or fall back to a generated domain
  const domain = app.info.previewDomain;

  return (
    <AppWrapper
      key={app.info.id}
      baseId={app.info.baseId}
      codeServerUrl={codeServerUrl}
      appName={app.info.name}
      initialMessages={uiMessages}
      consoleUrl={ephemeralUrl ? ephemeralUrl + "/__console" : ""}
      repo={app.info.gitRepo}
      appId={app.info.id}
      repoId={app.info.gitRepo}
      domain={domain ?? undefined}
      running={(await chatState(app.info.id)).state === "running"}
      showRecreate={showRecreate}
      sourceAppId={app.info.id}
      isPublic={app.info.is_public}
      isOwner={isOwner}
      isRecreatable={app.info.is_recreatable}
      isCrowdfunded={!!app.info.stripeProductId}
      stripeProductId={app.info.stripeProductId ?? undefined}
      requiresSubscription={app.info.requires_subscription}
      topBarActions={
        showRecreate && app.info.id ? (
          <RecreateButton sourceAppId={app.info.id} />
        ) : null
      }
    />
  );
}

function ProjectNotFound() {
  return (
    <div className="text-center my-16">
      Project not found or you don't have permission to access it.
      <div className="flex justify-center mt-4">
        <Link className={buttonVariants()} href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
}

function SubscriptionRequired() {
  return (
    <div className="text-center my-16">
      You must be subscribed to access this app.
      <div className="flex justify-center mt-4">
        <Link className={buttonVariants()} href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
}
