"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { createCrowdfund } from "@/actions/create-crowdfund";
import { useStripeConnectStatus } from "@/hooks/use-stripe-connect-status";

export function CrowdfundModal({
  appName,
  appId,
  onSuccess,
}: {
  appName: string;
  appId: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tiers, setTiers] = useState([{ price: "", description: "" }]);
  const { status, loading } = useStripeConnectStatus();

  const addTier = () => {
    setTiers([...tiers, { price: "", description: "" }]);
  };

  const handleTierChange = (index: number, field: string, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleSubmit = async () => {
    await createCrowdfund(appId, tiers);
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCrowdfundClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If still loading, don't do anything
    if (loading) return;
    
    // If user doesn't have a Stripe account or isn't onboarded, redirect to onboarding
    if (!status?.hasStripeAccount || !status?.isOnboarded) {
      try {
        const res = await fetch("/api/stripe/connect/start", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start onboarding");
        if (data.url) window.location.href = data.url;
      } catch (error) {
        console.error("Failed to start Stripe Connect onboarding:", error);
      }
      return;
    }
    
    // If user is onboarded, open the modal
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          aria-label="Crowdfund" 
          className="gap-2"
          onClick={handleCrowdfundClick}
          disabled={loading}
        >
          <span role="img" aria-hidden>💸</span>
          <span>{loading ? "Loading..." : "Crowdfund"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crowdfund {appName}</DialogTitle>
        </DialogHeader>
        <div>
          {tiers.map((tier, index) => (
            <div key={index} className="flex flex-col gap-2 mb-4">
              <Label>Tier {index + 1}</Label>
              <Input
                placeholder="Subscription Price"
                value={tier.price}
                onChange={(e) => handleTierChange(index, "price", e.target.value)}
              />
              <Input
                placeholder="Subscription Details"
                value={tier.description}
                onChange={(e) =>
                  handleTierChange(index, "description", e.target.value)
                }
              />
            </div>
          ))}
          <Button onClick={addTier} variant="outline" className="mb-4">
            Add Tier
          </Button>
          <Button onClick={handleSubmit}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
