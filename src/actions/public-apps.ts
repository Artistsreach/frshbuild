"use server";

import { appsTable } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getPublicApps() {
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
