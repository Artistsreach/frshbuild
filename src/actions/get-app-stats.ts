"use server";

import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

const dizzledb = drizzle(process.env.DATABASE_URL!, { schema });

export async function getAppStats(appId: string) {
  const app = await dizzledb.query.appsTable.findFirst({
    where: eq(appsTable.id, appId),
  });

  if (!app || !app.stripeProductId) {
    throw new Error("App not found or no Stripe product ID");
  }

  const stripeOptions = app.stripeAccountId
    ? { stripeAccount: app.stripeAccountId }
    : undefined;

  const prices = await stripe.prices.list(
    {
      product: app.stripeProductId,
      active: true,
    },
    stripeOptions
  );

  let totalRevenue = 0;
  let totalSubscriptions = 0;

  for (const price of prices.data) {
    const subscriptions = await stripe.subscriptions.list(
      {
        price: price.id,
        status: "active",
      },
      stripeOptions
    );

    totalSubscriptions += subscriptions.data.length;
    if (price.unit_amount) {
      totalRevenue += subscriptions.data.length * price.unit_amount;
    }
  }

  return {
    users: totalSubscriptions,
    revenue: totalRevenue / 100, // convert from cents to dollars
  };
}
