"use server";

import { db } from "@/lib/db";
import { appUsers, appsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { stackServerApp } from "@/auth/stack-auth";
import { headers } from "next/headers";

export async function createCrowdfund(
  appId: string,
  tiers: { price: string; description: string }[]
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has Stripe Connect account
  if (!user.serverMetadata.stripeAccountId) {
    throw new Error("Stripe Connect account required. Please complete onboarding first.");
  }

  // Check credits (80 credits required for crowdfunding)
  let credits = user.serverMetadata?.credits as number | undefined;
  if (credits === undefined) {
    credits = 100;
  }
  if (credits < 80) {
    throw new Error("Not enough credits. You need 80 credits to create a crowdfund.");
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

  // Validate tier prices
  for (const tier of tiers) {
    const price = parseFloat(tier.price);
    if (isNaN(price) || price <= 0) {
      throw new Error("Invalid price in tier");
    }
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Create product on the connected account
    const product = await stripe.products.create(
      {
        name: app.name,
        description: app.description || `Subscribe to ${app.name}`,
        metadata: {
          appId: appId,
          userId: user.userId,
        },
      },
      {
        stripeAccount: user.serverMetadata.stripeAccountId as string,
      }
    );

    // Create prices for each tier
    const prices = await Promise.all(
      tiers.map(async (tier, index) => {
        const price = await stripe.prices.create(
          {
            product: product.id,
            unit_amount: Math.round(parseFloat(tier.price) * 100), // Convert to cents
            currency: "usd",
            recurring: {
              interval: "month",
            },
            nickname: tier.description || `Tier ${index + 1}`,
            metadata: {
              appId: appId,
              userId: user.userId,
              tier: (index + 1).toString(),
            },
          },
          {
            stripeAccount: user.serverMetadata.stripeAccountId as string,
          }
        );
        return price;
      })
    );

    // Create payment links for each tier
    const paymentLinks = await Promise.all(
      prices.map(async (price, index) => {
        const paymentLink = await stripe.paymentLinks.create(
          {
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            subscription_data: {
              metadata: {
                appId: appId,
                userId: user.userId,
                tier: (index + 1).toString(),
              },
            },
            metadata: {
              appId: appId,
              userId: user.userId,
              tier: (index + 1).toString(),
            },
            after_completion: {
              type: "redirect",
              redirect: {
                url: `${origin}/app/${appId}?subscription=success`,
              },
            },
          },
          {
            stripeAccount: user.serverMetadata.stripeAccountId as string,
          }
        );
        return paymentLink;
      })
    );

    // Update app with Stripe information
    await db
      .update(appsTable)
      .set({
        stripeProductId: product.id,
        stripePriceIds: prices.map(p => p.id),
        stripeAccountId: user.serverMetadata.stripeAccountId as string,
        requires_subscription: true,
        is_public: true, // Make app public when crowdfunded
      })
      .where(eq(appsTable.id, appId));

    // Deduct credits
    await user.update({
      serverMetadata: {
        ...user.serverMetadata,
        credits: credits - 80,
      },
    });

    return { 
      success: true, 
      productId: product.id,
      priceIds: prices.map(p => p.id),
      paymentLinks: paymentLinks.map(pl => pl.url),
    };
  } catch (error) {
    console.error("Error creating crowdfund:", error);
    throw new Error(`Failed to create crowdfund: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
