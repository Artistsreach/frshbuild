"use server";

import { stripe } from "@/lib/stripe";
import { getUser } from "@/auth/get-user";
import { db } from "@/lib/db";
import { doc, getDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function createCheckoutSession(priceId: string, appId: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const profileRef = doc(firestoreDb, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  const profile = profileSnap.data();

  if (!profile) {
    throw new Error("User profile not found");
  }

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
      client_reference_id: user.uid,
      metadata: { appId, userId: user.uid },
      subscription_data: {
        metadata: { appId, userId: user.uid },
      },
      success_url: `${requestHeaders.get("origin")}/`,
      cancel_url: `${requestHeaders.get("origin")}/`,
    },
    {
      stripeAccount: profile.stripeAccountId,
    }
  );

  return { sessionId: session.id };
}
