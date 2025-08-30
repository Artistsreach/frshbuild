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

  console.log(`Processing webhook event: ${event.type}`);

  if (event.type === "customer.subscription.deleted") {
    // Decrement subscribed users on subscription cancellation
    const subscription = event.data.object as Stripe.Subscription;
    const appId = subscription.metadata?.appId;
    const userId = subscription.metadata?.userId;
    
    console.log(`Subscription deleted for app: ${appId}, user: ${userId}`);
    
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
    console.log(`Checkout completed: ${session.id}, mode: ${session.mode}`);
    
    // Handle subscription checkouts
    if (session.mode === "subscription") {
      const appId = session.metadata?.appId;
      const userId = session.metadata?.userId || session.client_reference_id;
      
      console.log(`Subscription checkout for app: ${appId}, user: ${userId}`);
      
      if (appId) {
        // Increment subscribed users count
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
      }
    } else {
      // Handle one-time payments (credits)
      const userId = session.client_reference_id;
      const amount = session.amount_total;
      
      console.log(`One-time payment for user: ${userId}, amount: ${amount}`);
      
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
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Handle subscription renewals
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const appId = subscription.metadata?.appId;
      const userId = subscription.metadata?.userId;
      
      console.log(`Invoice payment succeeded for subscription: ${subscription.id}, app: ${appId}`);
      
      // This ensures the subscription is properly tracked
      if (appId && userId) {
        await db
          .insert(appSubscriptions)
          .values({ appId, userId })
          .onConflictDoNothing({ target: [appSubscriptions.userId, appSubscriptions.appId] });
      }
    }
  } else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Handle failed subscription payments
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const appId = subscription.metadata?.appId;
      const userId = subscription.metadata?.userId;
      
      console.log(`Invoice payment failed for subscription: ${subscription.id}, app: ${appId}`);
      
      // You might want to send a notification to the user here
      // or handle the failed payment in some way
    }
  }

  return NextResponse.json({ received: true });
}
