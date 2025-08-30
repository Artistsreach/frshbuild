"use server";

import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function getAppPaymentLinks(appId: string) {
  try {
    const app = (
      await db.select().from(appsTable).where(eq(appsTable.id, appId))
    ).at(0);

    if (!app) {
      throw new Error("App not found");
    }

    if (!app.stripeProductId || !app.stripePriceIds || !app.stripeAccountId) {
      throw new Error("App is not set up for crowdfunding");
    }

    // Get the product and prices from Stripe
    const product = await stripe.products.retrieve(
      app.stripeProductId,
      {
        stripeAccount: app.stripeAccountId,
      }
    );

    const prices = await Promise.all(
      (app.stripePriceIds as string[]).map(priceId =>
        stripe.prices.retrieve(
          priceId,
          {
            stripeAccount: app.stripeAccountId!,
          }
        )
      )
    );

    // Create payment links for each price
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
                tier: (index + 1).toString(),
              },
            },
            metadata: {
              appId: appId,
              tier: (index + 1).toString(),
            },
            after_completion: {
              type: "redirect",
              redirect: {
                url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app/${appId}?subscription=success`,
              },
            },
          },
          {
            stripeAccount: app.stripeAccountId!,
          }
        );
        return {
          priceId: price.id,
          price: price.unit_amount! / 100, // Convert from cents
          currency: price.currency,
          nickname: price.nickname || `Tier ${index + 1}`,
          paymentLink: paymentLink.url,
        };
      })
    );

    return {
      appName: app.name,
      appDescription: app.description,
      paymentLinks,
    };
  } catch (error) {
    console.error("Error getting payment links:", error);
    throw new Error(`Failed to get payment links: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
