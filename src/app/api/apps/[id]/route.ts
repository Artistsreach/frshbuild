import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";
import { getAuthToken } from "@/actions/get-auth-token";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authentication token
    const authToken = await getAuthToken();
    const user = authToken ? { id: authToken.uid } : null;

    // Fetch the app
    const app = await getApp(id).catch(() => undefined);

    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    // Check if app is public
    const isPublic = app.info?.is_public || !!app.info?.stripeProductId;

    // If not public, require authentication and membership
    if (!isPublic) {
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const userPermission = (
        await db
          .select()
          .from(appUsers)
          .where(and(eq(appUsers.userId, user.id), eq(appUsers.appId, id)))
          .limit(1)
      ).at(0);

      if (!userPermission?.permissions) {
        return NextResponse.json(
          { error: "Permission denied" },
          { status: 403 }
        );
      }
    }

    // Get the app owner's user ID
    const appOwner = (
      await db
        .select()
        .from(appUsers)
        .where(and(eq(appUsers.appId, id), eq(appUsers.permissions, "admin")))
        .limit(1)
    ).at(0);

    // Return app data
    return NextResponse.json({
      id: app.info?.id,
      name: app.info?.name,
      gitRepo: app.info?.gitRepo,
      is_public: app.info?.is_public,
      baseId: app.info?.baseId,
      previewDomain: app.info?.previewDomain,
      is_recreatable: app.info?.is_recreatable,
      requires_subscription: app.info?.requires_subscription,
      stripeProductId: app.info?.stripeProductId,
      userId: appOwner?.userId || null, // Return the app owner's user ID
    });

  } catch (error) {
    console.error("Error in app API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
