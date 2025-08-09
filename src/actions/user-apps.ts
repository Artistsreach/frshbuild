"use server";

import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getUserApps() {
  // Try to fetch for an authenticated user first
  try {
    const user = await getUser();

    const userApps = await db
      .select({
        id: appsTable.id,
        name: appsTable.name,
        description: appsTable.description,
        gitRepo: appsTable.gitRepo,
        createdAt: appsTable.createdAt,
        public: appsTable.public,
        permissions: appUsers.permissions,
      })
      .from(appUsers)
      .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
      .where(eq(appUsers.userId, user.userId))
      .orderBy(desc(appsTable.createdAt));

    // Mark as deletable for owners/admins. For simplicity, allow delete if the relation exists.
    return userApps.map((a) => ({ ...a, deletable: true }));
  } catch {
    // Not logged in: return public apps (no delete capability)
    const publicApps = await db
      .select({
        id: appsTable.id,
        name: appsTable.name,
        createdAt: appsTable.createdAt,
      })
      .from(appsTable)
      .where(eq(appsTable.public, true))
      .orderBy(desc(appsTable.createdAt));

    return publicApps.map((a) => ({ ...a, deletable: false }));
  }
}
