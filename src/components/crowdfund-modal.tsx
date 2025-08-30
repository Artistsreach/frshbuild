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
import { toast } from "sonner";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, loading } = useStripeConnectStatus();

  const addTier = () => {
    setTiers([...tiers, { price: "", description: "" }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const handleTierChange = (index: number, field: string, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate tiers
    const validTiers = tiers.filter(tier => tier.price.trim() && tier.description.trim());
    if (validTiers.length === 0) {
      toast.error("Please add at least one tier with price and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCrowdfund(appId, validTiers);
      toast.success("Crowdfund created successfully! Your app is now available for subscriptions.");
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Crowdfund creation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create crowdfund");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrowdfundClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If still loading, don't do anything
    if (loading) return;
    
    // If user doesn't have a Stripe account or isn't onboarded, redirect to onboarding
    if (!status?.hasStripeAccount || !status?.isOnboarded) {
      try {
        toast.info("Setting up your Stripe account...");
        const res = await fetch("/api/stripe/connect/start", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start onboarding");
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Failed to start Stripe Connect onboarding:", error);
        toast.error("Failed to start Stripe onboarding. Please try again.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crowdfund {appName}</DialogTitle>
        </DialogHeader>
        
        {status && !status.isOnboarded && status.hasStripeAccount && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your Stripe account needs to be completed. Please complete the onboarding process to continue.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Create subscription tiers for your app. Users can subscribe to access your app.
          </div>

          {tiers.map((tier, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Tier {index + 1}</Label>
                {tiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`price-${index}`} className="text-xs">Price ($)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, "price", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                  <Input
                    id={`description-${index}`}
                    placeholder="Basic Plan"
                    value={tier.description}
                    onChange={(e) => handleTierChange(index, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={addTier} 
            variant="outline" 
            className="w-full"
            type="button"
          >
            Add Tier
          </Button>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Crowdfund
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
