"use client";

import React, { useEffect, useState } from "react";
import Chat from "./chat";
import { TopBar } from "./topbar";
import { MessageCircle, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import WebView from "./webview";
import { UIMessage } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecreateButton } from "./recreate-button";

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
}) {
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "preview">(
    "chat"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(!isPublic);

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
            />
          </div>
        </div>
      </div>

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
