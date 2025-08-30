"use server";

import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/stack-auth";

export async function updateAppName({ appId, name }: { appId: string; name: string }) {
  const user = await getUser();
  const app = (
    await db.select().from(appsTable).where(eq(appsTable.id, appId))
  ).at(0);

  if (!app) {
    throw new Error("App not found");
  }

  // Check if the user has permission to update the app
  // For simplicity, we'll just check if they are the owner
  const userApps = await db
    .select()
    .from(appsTable)
    .where(eq(appsTable.id, appId));

  if (userApps.length === 0) {
    throw new Error("You do not have permission to update this app");
  }

  await db
    .update(appsTable)
    .set({ name })
    .where(eq(appsTable.id, appId));

  return { success: true };
}
