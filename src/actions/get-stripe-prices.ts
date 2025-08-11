"use server";

import { stripe } from "@/lib/stripe";

export async function getStripePrices(productId: string) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
  });

  return prices.data;
}
