"use server";

import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/get-user";
import { revalidatePath } from "next/cache";

export async function setAppSubscription(appId: string, requiresSubscription: boolean) {
  const user = await getUser();

  if (!user) {
    throw new Error("You must be logged in to update an app");
  }

  const app = await db.query.appsTable.findFirst({
    where: eq(appsTable.id, appId),
  });

  if (!app) {
    throw new Error("App not found");
  }

  const userPermission = await db.query.appUsers.findFirst({
    where: (users, { and, eq }) => and(eq(users.appId, appId), eq(users.userId, user.uid)),
  });

  if (!userPermission) {
    throw new Error("You don't have permission to update this app");
  }

  await db
    .update(appsTable)
    .set({ requires_subscription: requiresSubscription })
    .where(eq(appsTable.id, appId));

  revalidatePath(`/app/${appId}`);
}
