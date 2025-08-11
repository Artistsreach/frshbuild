"use server";

import { stripe } from "@/lib/stripe";
import { getUser } from "@/auth/stack-auth";
import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function createCheckoutSession(priceId: string) {
  const user = await getUser();

  const requestHeaders = await headers();
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${requestHeaders.get("origin")}/`,
      cancel_url: `${requestHeaders.get("origin")}/`,
    },
    {
      stripeAccount: user.stripeAccountId,
    }
  );

  return { sessionId: session.id };
}
