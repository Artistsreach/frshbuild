"use client";

import { ArrowUpRightIcon, ComputerIcon, GlobeIcon, TerminalIcon, CoinsIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUserCredits } from "@/actions/get-user-credits";
import { getUser } from "@/actions/get-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { CrowdfundModal } from "./crowdfund-modal";
import { ShareButton } from "./share-button";
import { TierSelectionModal } from "./tier-selection-modal";
import { PurchaseModal } from "./purchase-modal";
import { SupabaseConnectModal } from "./supabase-connect-modal";

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
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  const { data: credits } = useQuery({
    queryKey: ["credits"],
    queryFn: () => getUserCredits(),
    refetchInterval: 5000,
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-gray-200 dark:border-black bg-background justify-between">
      <div className="flex items-center gap-4">
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
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <div
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
              onClick={() => setPurchaseModalOpen(true)}
            >
              <CoinsIcon className="h-4 w-4 dark:text-yellow-400" />
              {credits}
            </div>
            <PurchaseModal
              open={purchaseModalOpen}
              onOpenChange={setPurchaseModalOpen}
              userId={user?.id ?? ""}
            />
          </>
        )}
        {children}
        {isOwner && isPublic && !isCrowdfunded && (
          <CrowdfundModal appName={appName} appId={appId} />
        )}
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
          <>
            <Button size="sm" variant="outline" onClick={() => setSupabaseModalOpen(true)}>
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
        {isOwner && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant={"ghost"}>
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
      </div>
    </div>
  );
}
