"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { getStripePrices } from "@/actions/get-stripe-prices";
import type Stripe from "stripe";
import { createCheckoutSession } from "@/actions/create-checkout-session";
import { loadStripe } from "@stripe/stripe-js";

type TierSelectionModalProps = {
  appName: string;
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TierSelectionModal({
  appName,
  productId,
  open,
  onOpenChange,
}: TierSelectionModalProps) {
  const [prices, setPrices] = useState<Stripe.Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getStripePrices(productId)
        .then(setPrices)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [productId, open]);

  const handleSubscribe = async (priceId: string) => {
    const { sessionId } = await createCheckoutSession(priceId);
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Tier for {appName}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex flex-col gap-4">
            {prices.map((price) => (
              <Button
                key={price.id}
                onClick={() => handleSubscribe(price.id)}
                variant="outline"
              >
                {price.nickname || "Standard"} - $
                {(price.unit_amount! / 100).toFixed(2)} / month
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
