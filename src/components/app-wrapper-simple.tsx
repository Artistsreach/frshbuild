"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Monitor } from "lucide-react";
import { TopBar } from "./topbar";
import WebView from "./webview";
import Chat from "./chat";
import { UIMessage } from "ai";

const queryClient = new QueryClient();

interface AppWrapperProps {
  baseId: string;
  codeServerUrl: string;
  appName: string;
  initialMessages: UIMessage[];
  consoleUrl: string;
  repo: string;
  appId: string;
  repoId: string;
  domain?: string;
  running: boolean;
  showRecreate: boolean;
  sourceAppId: string;
  isPublic: boolean;
  isOwner: boolean;
  isRecreatable: boolean;
  isCrowdfunded: boolean;
  stripeProductId?: string;
  requiresSubscription: boolean;
  isSubscriber: boolean;
  authToken?: string;
  topBarActions?: React.ReactNode;
}

export default function AppWrapper(props: AppWrapperProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [device, setDevice] = useState<"desktop" | "tablet" | "phone">("desktop");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");

  // Remove custom token authentication since user is already authenticated via Firebase Auth
  // useEffect(() => {
  //   if (props.authToken) {
  //     const auth = getAuth();
  //     signInWithCustomToken(auth, props.authToken).catch((error) => {
  //       console.error("Error signing in with custom token:", error);
  //     });
  //   }
  // }, [props.authToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen min-h-0">
        <TopBar
          appName={props.appName}
          repoId={props.repoId}
          isPublic={props.isPublic}
          consoleUrl={props.consoleUrl}
          codeServerUrl={props.codeServerUrl}
          appId={props.appId}
          isRecreatable={props.isRecreatable ?? false}
          isCrowdfunded={props.isCrowdfunded ?? false}
          domain={props.domain}
          isOwner={props.isOwner ?? false}
          stripeProductId={props.stripeProductId}
          baseId={props.baseId}
          device={device}
          onDeviceChange={setDevice}
        >
          {props.topBarActions}
        </TopBar>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          {/* Hidden tab bar - always on chat tab */}
          <div className="hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="app">App</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="app" className="flex-1 mt-0 min-h-0">
            <WebView
              repo={props.repo}
              baseId={props.baseId}
              appId={props.appId}
              domain={props.domain}
              isOwner={props.isOwner ?? false}
              isPublic={props.isPublic ?? false}
              isRecreatable={props.isRecreatable ?? false}
              requiresSubscription={props.requiresSubscription ?? false}
              appName={props.appName}
              isCrowdfunded={props.isCrowdfunded ?? false}
              device={device}
            />
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 mt-0 min-h-0 relative">
            {props.isOwner ? (
              <>
                {/* Mobile Toggle Button - Floating - Only for owners */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                  <div className="flex rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-1">
                    <Button
                      variant={mobileView === "chat" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMobileView("chat")}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Button>
                    <Button
                      variant={mobileView === "preview" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMobileView("preview")}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </div>
                
                {/* Desktop Layout - Side by Side - Only for owners */}
                <div className="hidden md:flex h-full min-h-0">
                  {/* Chat Panel - Left Side */}
                  <div className="w-1/4 border-r flex flex-col min-h-0">
                    <Chat
                      appId={props.appId}
                      initialMessages={props.initialMessages}
                      running={props.running}
                    />
                  </div>
                  {/* Web Preview - Right Side */}
                  <div className="w-3/4 flex flex-col min-h-0">
                    <WebView
                      repo={props.repo}
                      baseId={props.baseId}
                      appId={props.appId}
                      domain={props.domain}
                      isOwner={props.isOwner ?? false}
                      isPublic={props.isPublic ?? false}
                      isRecreatable={props.isRecreatable ?? false}
                      requiresSubscription={props.requiresSubscription ?? false}
                      appName={props.appName}
                      isCrowdfunded={props.isCrowdfunded ?? false}
                      device={device}
                    />
                  </div>
                </div>
                
                {/* Mobile Layout - Toggle between Chat and Preview */}
                <div className="md:hidden h-full min-h-0">
                  {mobileView === "chat" ? (
                    <Chat
                      appId={props.appId}
                      initialMessages={props.initialMessages}
                      running={props.running}
                    />
                  ) : (
                    <WebView
                      repo={props.repo}
                      baseId={props.baseId}
                      appId={props.appId}
                      domain={props.domain}
                      isOwner={props.isOwner ?? false}
                      isPublic={props.isPublic ?? false}
                      isRecreatable={props.isRecreatable ?? false}
                      requiresSubscription={props.requiresSubscription ?? false}
                      appName={props.appName}
                      isCrowdfunded={props.isCrowdfunded ?? false}
                      device={device}
                    />
                  )}
                </div>
              </>
            ) : (
              // Non-owners see only the app preview
              <WebView
                repo={props.repo}
                baseId={props.baseId}
                appId={props.appId}
                domain={props.domain}
                isOwner={props.isOwner ?? false}
                isPublic={props.isPublic ?? false}
                isRecreatable={props.isRecreatable ?? false}
                requiresSubscription={props.requiresSubscription ?? false}
                appName={props.appName}
                isCrowdfunded={props.isCrowdfunded ?? false}
                device={device}
              />
            )}
          </TabsContent>
          
          <TabsContent value="console" className="flex-1 mt-0 min-h-0">
            <iframe
              src={props.consoleUrl}
              className="w-full h-full border-0"
              title="Console"
            />
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
