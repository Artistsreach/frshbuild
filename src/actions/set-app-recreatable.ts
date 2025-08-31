"use server";

import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/get-user";
import { redirect } from "next/navigation";

export async function setAppRecreatable({
  appId,
  recreatable,
}: {
  appId: string;
  recreatable: boolean;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  await db
    .update(appsTable)
    .set({ is_recreatable: recreatable })
    .where(eq(appsTable.id, appId));
}
