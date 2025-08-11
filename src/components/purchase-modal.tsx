"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function PurchaseModal({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = () => {
    setLoading(true);
    window.location.href = "https://buy.stripe.com/4gM00jeXih2VgzH4IWeEo1f";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center">
          <span>500 Credits</span>
          <span>$5.00</span>
        </div>
        <Button onClick={handlePurchase} disabled={loading}>
          {loading ? "Processing..." : "Purchase"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
