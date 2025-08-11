"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getStripePrice(appId: string) {
  const app = (
    await db.select().from(appsTable).where(eq(appsTable.id, appId))
  ).at(0);

  if (!app) {
    throw new Error("App not found");
  }

  if (!app.stripePriceIds) {
    return null;
  }

  const prices = await Promise.all(
    app.stripePriceIds.map((priceId) => stripe.prices.retrieve(priceId))
  );

  return prices;
}
