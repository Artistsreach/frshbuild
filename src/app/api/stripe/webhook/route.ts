import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { appSubscriptions, appUsers, appsTable } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { redisPublisher } from "@/lib/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Idempotency: ensure we only process each Stripe event once
  const idempotencyKey = `stripe:webhook:${event.id}`;
  const set = await redisPublisher.set(idempotencyKey, "1", { NX: true, EX: 60 * 60 * 24 });
  if (!set) {
    return NextResponse.json({ received: true, duplicated: true });
  }

  if (event.type === "customer.subscription.deleted") {
    // Decrement subscribed users on subscription cancellation
    const subscription = event.data.object as Stripe.Subscription;
    const appId = subscription.metadata?.appId;
    const userId = subscription.metadata?.userId;
    if (appId) {
      await db
        .update(appsTable)
        .set({ subscribedUsers: sql`GREATEST(${appsTable.subscribedUsers} - 1, 0)` })
        .where(eq(appsTable.id, appId));
    }
    if (appId && userId) {
      // Remove mapping
      await db.delete(appSubscriptions).where(
        and(eq(appSubscriptions.appId, appId), eq(appSubscriptions.userId, userId))
      );
    }
  } else if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // If this is a subscription for an app, increment subscribed_users
    const appId = session.metadata?.appId;
    const userId = (session.metadata?.userId || session.client_reference_id) ?? undefined;
    if (session.mode === "subscription" && appId) {
      await db
        .update(appsTable)
        .set({ subscribedUsers: sql`${appsTable.subscribedUsers} + 1` })
        .where(eq(appsTable.id, appId));
      if (userId) {
        // Upsert subscription mapping
        await db
          .insert(appSubscriptions)
          .values({ appId, userId })
          .onConflictDoNothing({ target: [appSubscriptions.userId, appSubscriptions.appId] });
      }
    } else {
      // Fallback: existing credits top-up flow using client_reference_id
      const userId = session.client_reference_id;
      const amount = session.amount_total;
      if (userId && amount) {
        const credits = amount / 10; // $5 for 500 credits
        await db
          .update(appUsers)
          .set({
            credits: sql`${appUsers.credits} + ${credits}`,
          })
          .where(eq(appUsers.userId, userId));
      }
    }
  }

  return NextResponse.json({ received: true });
}
