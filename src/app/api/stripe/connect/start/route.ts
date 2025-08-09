import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { stackServerApp } from "@/auth/stack-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure a connected account exists for this user
    let accountId = user.serverMetadata?.stripeAccountId as string | undefined;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          product_description: "Accept payments for user apps on Adorable",
        },
      });

      accountId = account.id;
      await user.update({
        serverMetadata: {
          ...(user.serverMetadata || {}),
          stripeAccountId: accountId,
        },
      });
    }

    // Build return/refresh URLs
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${origin}/connect/return`;
    const refreshUrl = `${origin}/connect/refresh`;

    // Create Account Link for hosted onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("/api/stripe/connect/start error", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
