import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/auth/get-user";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { appId } = body || {};

    const price = process.env.STRIPE_PREORDER_PRICE_ID;
    if (!price) {
      return NextResponse.json(
        { error: "Missing STRIPE_PREORDER_PRICE_ID in environment" },
        { status: 500 },
      );
    }

    // Create a Payment Link for a subscription price
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price, quantity: 1 }],
      metadata: {
        userId: user.uid,
        appId: appId || "",
        purpose: "subscription_preorder",
      },
    });

    return NextResponse.json({ url: paymentLink.url, id: paymentLink.id });
  } catch (err: any) {
    console.error("/api/stripe/preorder/link error", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
