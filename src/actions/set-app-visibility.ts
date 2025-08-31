"use server";

import { getUser } from "@/auth/get-user";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export async function setAppVisibility({
  appId,
  public: isPublic,
}: {
  appId: string;
  public: boolean;
}) {
  const user = await getUser();

  // Ensure the caller is an admin on this app
  if (!user) {
    throw new Error("User not found");
  }
  const membership = (
    await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.appId, appId), eq(appUsers.userId, user.uid)))
      .limit(1)
  ).at(0);

  if (!membership || membership.permissions !== "admin") {
    throw new Error("Not authorized to change app visibility");
  }

  await db.update(appsTable).set({ is_public: isPublic }).where(eq(appsTable.id, appId));

  return { success: true } as const;
}
