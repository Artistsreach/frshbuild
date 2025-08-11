"use client";

import { Button } from "@/components/ui/button";
import {
  Share2Icon,
  LinkIcon,
  CopyIcon,
  ExternalLinkIcon,
  RocketIcon,
  Loader2Icon,
  GlobeIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { publishApp } from "@/actions/publish-app";
import { setAppVisibility } from "@/actions/set-app-visibility";
import { setAppRecreatable } from "@/actions/set-app-recreatable";
import { setAppSubscription } from "@/actions/set-app-subscription";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface ShareButtonProps {
  className?: string;
  domain?: string;
  appId: string;
  isPublic?: boolean;
  isRecreatable?: boolean;
  requiresSubscription?: boolean;
}

export function ShareButton({
  className,
  domain,
  appId,
  isPublic = false,
  isRecreatable = false,
  requiresSubscription = false,
}: ShareButtonProps) {
  // The domain may be undefined if no previewDomain exists in the database
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [publicState, setPublicState] = useState(isPublic);
  const [recreatable, setRecreatable] = useState(isRecreatable);
  const [requiresSubscriptionState, setRequiresSubscriptionState] = useState(requiresSubscription);

  const handleRecreatableChange = async (checked: boolean) => {
    setRecreatable(checked);
    try {
      await setAppRecreatable({ appId, recreatable: checked });
      toast.success(
        `App is now ${checked ? "recreatable" : "not recreatable"}`
      );
    } catch (error) {
      toast.error("Failed to update recreatable status");
      setRecreatable(!checked);
    }
  };

  const handleSubscriptionChange = async (checked: boolean) => {
    setRequiresSubscriptionState(checked);
    try {
      await setAppSubscription(appId, checked);
      toast.success(
        `App now ${checked ? "requires a subscription" : "does not require a subscription"}`
      );
    } catch (error) {
      toast.error("Failed to update subscription requirement");
      setRequiresSubscriptionState(!checked);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishApp({
        appId: appId,
      });
      toast.success("Latest version published successfully!");
    } catch (error) {
      toast.error("Failed to publish app");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setIsUpdatingVisibility(true);
      await setAppVisibility({ appId, public: !publicState });
      setPublicState((p) => !p);
      toast.success(!publicState ? "App is now public" : "App is now private");
    } catch (error) {
      toast.error("Failed to update visibility");
      console.error(error);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${className || ""}`}
        >
          Share
          <Share2Icon className="h-4 w-4 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Share App</DialogTitle>
          <DialogDescription>
            {domain
              ? "Share your app using the preview domain or publish the latest version."
              : "Publish your app to create a shareable preview URL."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 mt-4">
          {domain ? (
            <>
              <div>
                <Label htmlFor="share-url" className="mb-2 block">
                  Preview Domain
                </Label>
                <div className="grid grid-cols-[1fr_auto] w-full overflow-hidden border border-input rounded-md">
                  <div className="overflow-hidden flex items-center bg-muted px-3 py-2">
                    <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <div className="truncate">
                      <span className="text-sm">https://{domain}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 px-3 border-l border-input rounded-l-none"
                    onClick={() => copyToClipboard(`https://${domain}`)}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(`https://${domain}`, "_blank")}
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Visit Preview
                </Button>

                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label>Recreatable</Label>
                    <DialogDescription>
                      Allow others to recreate this app.
                    </DialogDescription>
                  </div>
                  <Switch
                    checked={recreatable}
                    onCheckedChange={handleRecreatableChange}
                  />
                </div>
                {publicState && (
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <Label>Require Subscription</Label>
                      <DialogDescription>
                        Only subscribed users can access this app.
                      </DialogDescription>
                    </div>
                    <Switch
                      checked={requiresSubscriptionState}
                      onCheckedChange={handleSubscriptionChange}
                    />
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                >
                  {isUpdatingVisibility ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : publicState ? (
                    <LockIcon className="h-4 w-4" />
                  ) : (
                    <GlobeIcon className="h-4 w-4" />
                  )}
                  {publicState ? "Make Private" : "Make Public"}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <RocketIcon className="h-4 w-4" />
                  )}
                  Publish Latest
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                No preview domain available yet. Publish your app to create a
                preview URL.
              </p>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm mb-2">
                <div className="space-y-0.5">
                  <Label>Recreatable</Label>
                  <DialogDescription>
                    Allow others to recreate this app.
                  </DialogDescription>
                </div>
                <Switch
                  checked={recreatable}
                  onCheckedChange={handleRecreatableChange}
                />
              </div>
              <Button
                variant="secondary"
                size="default"
                className="gap-2 w-full mb-2"
                onClick={handleToggleVisibility}
                disabled={isUpdatingVisibility}
              >
                {isUpdatingVisibility ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : publicState ? (
                  <LockIcon className="h-4 w-4" />
                ) : (
                  <GlobeIcon className="h-4 w-4" />
                )}
                {publicState ? "Make Private" : "Make Public"}
              </Button>
              <Button
                variant="default"
                size="default"
                className="gap-2 w-full"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <RocketIcon className="h-4 w-4" />
                )}
                Publish
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
