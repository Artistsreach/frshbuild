"use server";

import { getUser } from "@/auth/get-user";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getUserApps() {
  const user = await getUser();

  if (user) {
    const userApps = await db
      .select({
        id: appsTable.id,
        name: appsTable.name,
        description: appsTable.description,
        gitRepo: appsTable.gitRepo,
        createdAt: appsTable.createdAt,
        is_public: appsTable.is_public,
        is_recreatable: appsTable.is_recreatable,
        permissions: appUsers.permissions,
        stripeProductId: appsTable.stripeProductId,
      })
      .from(appUsers)
      .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
      .where(eq(appUsers.userId, user.uid))
      .orderBy(desc(appsTable.createdAt));

    // Mark as deletable for owners/admins. For simplicity, allow delete if the relation exists.
    return userApps.map((a) => ({ ...a, deletable: true }));
  } else {
    const publicApps = await db
      .select({
        id: appsTable.id,
        name: appsTable.name,
        createdAt: appsTable.createdAt,
        stripeProductId: appsTable.stripeProductId,
        is_public: appsTable.is_public,
        is_recreatable: appsTable.is_recreatable,
      })
      .from(appsTable)
      .where(eq(appsTable.is_public, true))
      .orderBy(desc(appsTable.createdAt));

    return publicApps.map((a) => ({ ...a, deletable: false }));
  }
}
