"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowUpRightIcon, GlobeIcon, TerminalIcon, CoinsIcon, RefreshCwIcon, Monitor, Tablet, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { firebaseFunctions } from "@/lib/firebaseFunctions";
import { PurchaseModal } from "./purchase-modal";
import { TierSelectionModal } from "./tier-selection-modal";
import { SupabaseConnectModal } from "./supabase-connect-modal";
import { MintNftModal } from "./mint-nft-modal";
import { ShareButton } from "./share-button";
import { CrowdfundModal } from "./crowdfund-modal";
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";
import Image from "next/image";

export function TopBar({
  appName,
  children,
  repoId,
  consoleUrl,
  codeServerUrl,
  isPublic,
  appId,
  isRecreatable,
  domain,
  isCrowdfunded,
  isOwner,
  stripeProductId,
  baseId,
  device,
  onDeviceChange,
}: {
  appName: string;
  children?: React.ReactNode;
  repoId: string;
  consoleUrl: string;
  codeServerUrl: string;
  isPublic?: boolean;
  appId: string;
  isRecreatable: boolean;
  domain?: string;
  isCrowdfunded: boolean;
  isOwner: boolean;
  stripeProductId?: string;
  baseId?: string;
  device?: "desktop" | "tablet" | "phone";
  onDeviceChange?: (device: "desktop" | "tablet" | "phone") => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const currentDevice = device || "desktop";

  const [credits, setCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const { user: firebaseUser } = useAuth();

  // Get Firebase credits using the same method as the home page
  useEffect(() => {
    if (!firebaseUser) {
      setCredits(0);
      setCreditsLoading(false);
      return;
    }

    const getCredits = async () => {
      try {
        setCreditsLoading(true);
        const userCredits = await firebaseFunctions.getUserCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error('Error getting credits:', error);
        setCredits(0);
      } finally {
        setCreditsLoading(false);
      }
    };

    getCredits();

    // Set up polling for real-time updates (same as CreditsDisplay)
    const interval = setInterval(async () => {
      try {
        const userCredits = await firebaseFunctions.getUserCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error('Error updating credits:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [firebaseUser]);

  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-gray-200 dark:border-black bg-background justify-between">
      {/* Left side: Logo, ratios, refresh, dark mode */}
      <div className="flex items-center gap-2">
        <Link href={"/"}>
          <Image
            src="https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"
            alt="Adorable Logo"
            width={24}
            height={24}
            className="dark:invert h-6 w-6"
            priority
          />
        </Link>
        
        {/* Aspect ratio buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant={currentDevice === "desktop" ? "default" : "outline"}
            size="icon"
            onClick={() => onDeviceChange?.("desktop")}
            aria-label="Desktop preview"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={currentDevice === "tablet" ? "default" : "outline"}
            size="icon"
            onClick={() => onDeviceChange?.("tablet")}
            aria-label="Tablet preview"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={currentDevice === "phone" ? "default" : "outline"}
            size="icon"
            onClick={() => onDeviceChange?.("phone")}
            aria-label="Phone preview"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // This will be handled by the WebView component
            window.location.reload();
          }}
          aria-label="Refresh preview"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
        
        {/* Dark mode toggle */}
        <ModeToggle />
      </div>
      
      {/* Right side: Credits, mint as nft, crowdfund, supabase, edit, share */}
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <div
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer px-2 py-1 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
              onClick={() => setPurchaseModalOpen(true)}
            >
              <CoinsIcon className="h-4 w-4 dark:text-yellow-400" />
              <span className="font-bold">
                {creditsLoading ? "..." : credits}
              </span>
            </div>
            <PurchaseModal
              open={purchaseModalOpen}
              onOpenChange={setPurchaseModalOpen}
              userId={firebaseUser?.uid ?? ""}
            />
          </>
        )}
        
        {isOwner && isPublic && (
          <MintNftModal 
            appName={appName} 
            appId={appId} 
            gitRepo={repoId} 
            frameworkName={baseId}
          />
        )}
        
        {isOwner && isPublic && !isCrowdfunded && (
          <CrowdfundModal appName={appName} appId={appId} />
        )}
        
        {isOwner && (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSupabaseModalOpen(true)}
              className="hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
            >
              <Image
                src="https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/IMG_7042.png"
                alt="Connect Supabase"
                width={16}
                height={16}
                className="h-4 w-4"
              />
            </Button>
            <SupabaseConnectModal
              open={supabaseModalOpen}
              onOpenChange={setSupabaseModalOpen}
            />
          </>
        )}
        
        {children}
        
        {/* Subscribe button logic, similar to AppCard */}
        {stripeProductId && isPublic && !isOwner && (
          <>
            <Button size="sm" onClick={() => setTierModalOpen(true)}>
              Subscribe
            </Button>
            <TierSelectionModal
              appName={appName}
              productId={stripeProductId}
              open={tierModalOpen}
              onOpenChange={setTierModalOpen}
              appId={appId}
            />
          </>
        )}
        
        {isOwner && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant={"ghost"}
                className="hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              >
                <img
                  src="/logos/vscode.svg"
                  className="h-4 w-4"
                  alt="VS Code Logo"
                />
                <TerminalIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Open In</DialogTitle>
              </DialogHeader>
              <div>
                <div className="flex flex-col gap-2 pb-4">
                  <div className="font-bold mt-4 flex items-center gap-2">
                    <GlobeIcon className="inline h-4 w-4 ml-1" />
                    Browser
                  </div>
                  <div>
                    <a href={codeServerUrl} target="_blank" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src="/logos/vscode.svg"
                            className="h-4 w-4"
                            alt="VS Code Logo"
                          />
                          <span>VS Code</span>
                        </div>
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <div>
                    <a href={consoleUrl} target="_blank" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <TerminalIcon className="h-4 w-4" />
                          <span>Console</span>
                        </div>
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {isOwner && (
          <ShareButton
            domain={domain}
            appId={appId}
            appName={appName}
            isPublic={isPublic}
            isRecreatable={isRecreatable}
            requiresSubscription={false}
            baseId={baseId}
          />
        )}
      </div>
      

    </div>
  );
}
