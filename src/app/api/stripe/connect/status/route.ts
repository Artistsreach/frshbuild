import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { stackServerApp } from "@/auth/stack-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accountId = user.serverMetadata?.stripeAccountId as string | undefined;
    
    if (!accountId) {
      return NextResponse.json({ 
        hasStripeAccount: false, 
        isOnboarded: false,
        accountId: null 
      });
    }

    // Retrieve the account to check its status
    const account = await stripe.accounts.retrieve(accountId);
    
    // Check if the account is fully onboarded
    // An account is considered onboarded when it has the required capabilities enabled
    const isOnboarded = account.charges_enabled && 
                       account.payouts_enabled && 
                       account.details_submitted;

    return NextResponse.json({ 
      hasStripeAccount: true, 
      isOnboarded,
      accountId,
      accountStatus: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements
      }
    });
  } catch (err: any) {
    console.error("/api/stripe/connect/status error", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
