"use client";

import React, { useEffect, useRef, useState } from "react";
import Chat from "./chat";
import { TopBar } from "./topbar";
import { MessageCircle, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import WebView from "./webview";
import { UIMessage } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecreateButton } from "./recreate-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { TierSelectionModal } from "./tier-selection-modal";

const queryClient = new QueryClient();

export default function AppWrapper({
  appName,
  repo,
  initialMessages,
  appId,
  repoId,
  baseId,
  domain,
  running,
  codeServerUrl,
  consoleUrl,
  topBarActions,
  showRecreate,
  sourceAppId,
  isPublic,
  isOwner,
  isRecreatable,
  isCrowdfunded,
  stripeProductId,
  requiresSubscription,
  isSubscriber,
}: {
  appName: string;
  repo: string;
  appId: string;
  respond?: boolean;
  initialMessages: UIMessage[];
  repoId: string;
  baseId: string;
  codeServerUrl: string;
  consoleUrl: string;
  domain?: string;
  running: boolean;
  topBarActions?: React.ReactNode;
  showRecreate?: boolean;
  sourceAppId?: string;
  isPublic?: boolean;
  isOwner: boolean;
  isRecreatable: boolean;
  isCrowdfunded: boolean;
  stripeProductId?: string;
  requiresSubscription?: boolean;
  isSubscriber?: boolean;
}) {
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "preview">(
    "chat"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(!isPublic);
  const [locked, setLocked] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  const gatingEnabled = !!isPublic && !!isCrowdfunded && !!stripeProductId && !isOwner && !isSubscriber;
  const OPEN_MS = 5 * 60 * 1000; // 5 minutes
  const LOCK_MS = 5 * 60 * 1000; // 5 minutes
  const openStartedKey = `trial_open_started_${appId}`;
  const lockUntilKey = `trial_lock_until_${appId}`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // or 'visible'
    };
  }, []);

  // Trial gating cycle: 5 min open, 5 min locked, repeat, persisted per app
  useEffect(() => {
    if (!gatingEnabled) return;

    const now = Date.now();
    const lockUntilStr = typeof window !== "undefined" ? localStorage.getItem(lockUntilKey) : null;
    const openStartedStr = typeof window !== "undefined" ? localStorage.getItem(openStartedKey) : null;

    // Helper to clear timers
    const clearTimers = () => {
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      lockTimeoutRef.current = null;
      unlockTimeoutRef.current = null;
    };

    const scheduleLock = (ms: number) => {
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = setTimeout(() => {
        const newLockUntil = Date.now() + LOCK_MS;
        localStorage.setItem(lockUntilKey, String(newLockUntil));
        setLocked(true);
        // Schedule unlock when lock period ends
        scheduleUnlock(LOCK_MS);
      }, Math.max(0, ms));
    };

    const scheduleUnlock = (ms: number) => {
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = setTimeout(() => {
        // End lock; start a fresh open window
        localStorage.removeItem(lockUntilKey);
        const newOpenStartedAt = Date.now();
        localStorage.setItem(openStartedKey, String(newOpenStartedAt));
        setLocked(false);
        // Schedule next lock at end of open window
        scheduleLock(OPEN_MS);
      }, Math.max(0, ms));
    };

    // Determine current state based on persisted keys
    if (lockUntilStr) {
      const lockUntil = parseInt(lockUntilStr, 10);
      if (!isNaN(lockUntil) && now < lockUntil) {
        // Still locked; keep locked and schedule unlock
        setLocked(true);
        setRemainingMs(lockUntil - now);
        scheduleUnlock(lockUntil - now);
        return;
      } else {
        // Lock expired; clear and start new open window
        localStorage.removeItem(lockUntilKey);
      }
    }

    const openStartedAt = openStartedStr ? parseInt(openStartedStr, 10) : NaN;
    if (!isNaN(openStartedAt)) {
      const elapsed = now - openStartedAt;
      if (elapsed < OPEN_MS) {
        // Continue open window, schedule upcoming lock
        setLocked(false);
        setRemainingMs(OPEN_MS - elapsed);
        scheduleLock(OPEN_MS - elapsed);
        return;
      }
    }

    // Otherwise, start a fresh open window now
    localStorage.setItem(openStartedKey, String(now));
    setLocked(false);
    setRemainingMs(OPEN_MS);
    scheduleLock(OPEN_MS);

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatingEnabled, appId]);

  // Tick the countdown every second when gating is on
  useEffect(() => {
    if (!gatingEnabled) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const lockUntilStr = localStorage.getItem(lockUntilKey);
      if (lockUntilStr) {
        const lockUntil = parseInt(lockUntilStr, 10);
        const ms = Math.max(0, lockUntil - now);
        setRemainingMs(ms);
      } else {
        const openStartedStr = localStorage.getItem(openStartedKey);
        const openStartedAt = openStartedStr ? parseInt(openStartedStr, 10) : NaN;
        if (!isNaN(openStartedAt)) {
          const elapsed = now - openStartedAt;
          const ms = Math.max(0, OPEN_MS - elapsed);
          setRemainingMs(ms);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatingEnabled, appId]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="h-screen flex flex-col" style={{ height: "100dvh" }}>
      {/* Desktop and Mobile container */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Chat component - positioned for both mobile and desktop */}
        <div
          className={
            isMobile
              ? `absolute inset-0 z-10 flex flex-col transition-transform duration-200 ${
                  mobileActiveTab === "chat"
                    ? "translate-x-0"
                    : "-translate-x-full"
                }`
              : `h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
                  sidebarVisible ? "w-96" : "w-0"
                }`
          }
          style={
            isMobile
              ? {
                  top: "env(safe-area-inset-top)",
                  bottom: "calc(60px + env(safe-area-inset-bottom))",
                }
              : undefined
          }
        >
          <QueryClientProvider client={queryClient}>
            <Chat
              topBar={
                sidebarVisible ? (
                  <TopBar
                    appName={appName}
                    repoId={repoId}
                    isPublic={isPublic}
                    consoleUrl={consoleUrl}
                    codeServerUrl={codeServerUrl}
                    appId={appId}
                    isRecreatable={isRecreatable}
                    isCrowdfunded={isCrowdfunded}
                    domain={domain}
                    isOwner={isOwner}
                    stripeProductId={stripeProductId}
                  >
                    {topBarActions}
                  </TopBar>
                ) : null
              }
              appId={appId}
              initialMessages={initialMessages}
              key={appId}
              running={running}
              isOwner={isOwner}
            />
          </QueryClientProvider>
        </div>

        {/* Sidebar toggle button - only visible on desktop */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-20 bg-background border border-border rounded-r-lg p-2 shadow-lg hover:bg-accent transition-colors"
            style={{
              left: sidebarVisible ? "24rem" : "0", // 24rem = w-96
              transition: "left 300ms ease-in-out"
            }}
          >
            {sidebarVisible ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Preview component - positioned for both mobile and desktop */}
        <div
          className={
            isMobile
              ? `absolute inset-0 z-10 transition-transform duration-200 ${
                  mobileActiveTab === "preview"
                    ? "translate-x-0"
                    : "translate-x-full"
                }`
              : "flex-1 overflow-auto transition-all duration-300 ease-in-out"
          }
          style={
            isMobile
              ? {
                  top: "env(safe-area-inset-top)",
                  bottom: "calc(60px + env(safe-area-inset-bottom))",
                }
              : undefined
          }
        >
          <div className="h-full overflow-hidden relative">
            <WebView
              repo={repo}
              baseId={baseId}
              appId={appId}
              domain={domain}
              isPublic={!!isPublic}
              isRecreatable={!!isRecreatable}
              isOwner={isOwner}
              requiresSubscription={!!requiresSubscription}
              appName={appName}
              isCrowdfunded={!!isCrowdfunded}
            />
          </div>
        </div>
      </div>

      {/* Visible red timer badge */}
      {gatingEnabled && (
        <div className="fixed top-2 right-2 z-40">
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-1 text-sm font-semibold shadow-sm">
            {locked ? "Locked resumes in: " : "Free time left: "}
            {(() => {
              const totalSec = Math.ceil(remainingMs / 1000);
              const mm = Math.floor(totalSec / 60)
                .toString()
                .padStart(2, "0");
              const ss = (totalSec % 60).toString().padStart(2, "0");
              return `${mm}:${ss}`;
            })()}
          </div>
        </div>
      )}

      {/* Trial gating modal and overlay */}
      {gatingEnabled && locked && (
        <>
          {/* Full-screen overlay to block interaction */}
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
          <Dialog open={true} onOpenChange={() => { /* unclosable */ }}>
            <DialogContent
              className="sm:max-w-md z-50"
              onEscapeKeyDown={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Free trial expired</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  You’ve used your free 5-minute preview. Please subscribe to continue using this app.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setSubscribeOpen(true)}>Subscribe</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <TierSelectionModal
            appName={appName}
            productId={stripeProductId as string}
            open={subscribeOpen}
            onOpenChange={setSubscribeOpen}
            appId={appId}
          />
        </>
      )}

      {/* Mobile tab navigation */}
      {isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 flex border-t bg-background/95 backdrop-blur-sm pb-safe"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <button
            onClick={() => setMobileActiveTab("chat")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
              mobileActiveTab === "chat"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle
              className={`h-6 w-6 mb-1 ${
                mobileActiveTab === "chat" ? "fill-current" : ""
              }`}
            />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button
            onClick={() => setMobileActiveTab("preview")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
              mobileActiveTab === "preview"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor
              className={`h-6 w-6 mb-1 ${
                mobileActiveTab === "preview" ? "fill-current" : ""
              }`}
            />
            <span className="text-xs font-medium">Preview</span>
          </button>
        </div>
      )}
    </div>
  );
}
