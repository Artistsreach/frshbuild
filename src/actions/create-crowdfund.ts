"use server";

import { db } from "@/lib/db";
import { appUsers, appsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { stackServerApp } from "@/auth/stack-auth";

export async function createCrowdfund(
  appId: string,
  tiers: { price: string; description: string }[]
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  if (user.serverMetadata.stripeAccountId) {
    let credits = user.serverMetadata?.credits as number | undefined;
    if (credits === undefined) {
      credits = 100;
    }
    if (credits < 80) {
      throw new Error("Not enough credits");
    }
  }

  const app = (
    await db.select().from(appsTable).where(eq(appsTable.id, appId))
  ).at(0);

  if (!app) {
    throw new Error("App not found");
  }

  if (tiers.length === 0) {
    throw new Error("At least one tier is required");
  }

  const firstTier = tiers[0];
  const remainingTiers = tiers.slice(1);

  const stripeOptions = user.serverMetadata.stripeAccountId
    ? { stripeAccount: user.serverMetadata.stripeAccountId as string }
    : undefined;

  const product = await stripe.products.create(
    {
      name: app.name,
      description: app.description,
      default_price_data: {
        unit_amount: parseInt(firstTier.price) * 100,
        currency: "usd",
        recurring: {
          interval: "month",
        },
      },
    },
    stripeOptions
  );

  const remainingPrices = await Promise.all(
    remainingTiers.map((tier) =>
      stripe.prices.create(
        {
          product: product.id,
          unit_amount: parseInt(tier.price) * 100,
          currency: "usd",
          recurring: {
            interval: "month",
          },
          nickname: tier.description,
        },
        stripeOptions
      )
    )
  );

  const allPriceIds = [
    product.default_price as string,
    ...remainingPrices.map((p) => p.id),
  ].filter(Boolean);

  await db
    .update(appsTable)
    .set({
      stripeProductId: product.id,
      stripePriceIds: allPriceIds,
      stripeAccountId: (user.serverMetadata.stripeAccountId as string) ?? null,
    })
    .where(eq(appsTable.id, appId));

  if (user.serverMetadata.stripeAccountId) {
    let credits = user.serverMetadata?.credits as number | undefined;
    if (credits === undefined) {
      credits = 100;
    }
    await user.update({
      serverMetadata: {
        ...user.serverMetadata,
        credits: credits - 80,
      },
    });
  }

  return { success: true };
}
