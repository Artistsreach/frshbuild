"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getAppPaymentLinks } from "@/actions/get-app-payment-links";
import { toast } from "sonner";
import { Loader2, CreditCard, ExternalLink, Users } from "lucide-react";

interface SubscriptionModalProps {
  appId: string;
  appName: string;
  isCrowdfunded: boolean;
  subscribedUsers?: number;
  children: React.ReactNode;
}

interface PaymentLink {
  priceId: string;
  price: number;
  currency: string;
  nickname: string;
  paymentLink: string;
}

interface AppPaymentData {
  appName: string;
  appDescription: string;
  paymentLinks: PaymentLink[];
}

export function SubscriptionModal({
  appId,
  appName,
  isCrowdfunded,
  subscribedUsers = 0,
  children,
}: SubscriptionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<AppPaymentData | null>(null);

  useEffect(() => {
    if (open && isCrowdfunded) {
      loadPaymentLinks();
    }
  }, [open, isCrowdfunded, appId]);

  const loadPaymentLinks = async () => {
    setLoading(true);
    try {
      const data = await getAppPaymentLinks(appId);
      setAppData(data);
    } catch (error) {
      console.error("Error loading payment links:", error);
      toast.error("Failed to load subscription options");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (paymentLink: string) => {
    window.open(paymentLink, "_blank");
  };

  if (!isCrowdfunded) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {appName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription options...</span>
          </div>
        ) : appData ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {appData.appDescription}
            </div>

            {subscribedUsers > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{subscribedUsers} subscriber{subscribedUsers !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="space-y-3">
              {appData.paymentLinks.map((link, index) => (
                <Card key={link.priceId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{link.nickname}</CardTitle>
                      <Badge variant="secondary" className="text-sm">
                        ${link.price}/{link.currency === 'usd' ? 'month' : link.currency}
                      </Badge>
                    </div>
                    <CardDescription>
                      Subscribe to access {appName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleSubscribe(link.paymentLink)}
                      className="w-full"
                      size="sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-xs text-muted-foreground text-center pt-4">
              You'll be redirected to Stripe to complete your subscription securely.
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No subscription options available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
