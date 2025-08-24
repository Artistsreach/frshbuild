"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { RefreshCwIcon, Monitor, Tablet, Smartphone } from "lucide-react";
import { ShareButton } from "./share-button";
import { ModeToggle } from "./theme-toggle";
import { CrowdfundModal } from "./crowdfund-modal";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
  isOwner?: boolean;
  isPublic?: boolean;
  isRecreatable?: boolean;
  requiresSubscription?: boolean;
  appName?: string;
  isCrowdfunded?: boolean;
}) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "phone">("desktop");

  useEffect(() => {
    // Capture screenshot on page unload/navigation
    const handler = async () => {
      try {
        if (!containerRef.current) return;
        const canvas = await (window as any).html2canvas?.(containerRef.current, {
          backgroundColor: null,
          useCORS: true,
          scale: 0.6,
          logging: false,
          windowWidth: containerRef.current.clientWidth,
          windowHeight: containerRef.current.clientHeight,
        });
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/webp", 0.9);
        await fetch(`/api/apps/${props.appId}/thumbnail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
          keepalive: true,
        });
      } catch (e) {
        // non-blocking
        console.debug("thumbnail capture failed", e);
      }
    };
    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, [props.appId]);

  useEffect(() => {
    // Expose a helper to capture a screenshot of the preview container
    (window as any).captureAppScreenshot = async (): Promise<string | null> => {
      try {
        if (!containerRef.current) return null;
        const canvas = await (window as any).html2canvas?.(containerRef.current, {
          backgroundColor: null,
          useCORS: true,
          scale: 0.8,
          logging: false,
          windowWidth: containerRef.current.clientWidth,
          windowHeight: containerRef.current.clientHeight,
        });
        if (!canvas) return null;
        return canvas.toDataURL("image/webp", 0.9);
      } catch (e) {
        console.debug("captureAppScreenshot failed", e);
        return null;
      }
    };
    return () => {
      try {
        delete (window as any).captureAppScreenshot;
      } catch {}
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l transition-opacity duration-700 mt-[2px]">
      <div className="h-12 border-b border-gray-200 dark:border-black items-center flex px-2 bg-background sticky top-0 justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="icon"
            onClick={() => setDevice("desktop")}
            aria-label="Desktop preview"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={device === "tablet" ? "default" : "outline"}
            size="icon"
            onClick={() => setDevice("tablet")}
            aria-label="Tablet preview"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={device === "phone" ? "default" : "outline"}
            size="icon"
            onClick={() => setDevice("phone")}
            aria-label="Phone preview"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => devServerRef.current?.refresh()}
            aria-label="Refresh preview"
          >
            <RefreshCwIcon />
          </Button>
          <ModeToggle />
          {props.isOwner && props.isPublic && !props.isCrowdfunded && (
            <CrowdfundModal appName={props.appName ?? "App"} appId={props.appId} />
          )}
          {props.isOwner && (
            <ShareButton
              domain={props.domain}
              appId={props.appId}
              isPublic={props.isPublic}
              isRecreatable={props.isRecreatable}
              requiresSubscription={props.requiresSubscription}
              baseId={props.baseId}
            />
          )}
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center p-3">
        {/*
          Wrapper that controls the size/aspect ratio. We rely on CSS aspect-ratio
          so the FreestyleDevServer fills the wrapper and adapts per selected device.
        */}
        {device === "desktop" && (
          <div className="w-full h-full">
            <FreestyleDevServer
              ref={devServerRef}
              actions={{ requestDevServer }}
              repoId={props.repo}
              loadingComponent={({ iframeLoading, devCommandRunning }) =>
                !devCommandRunning && (
                  <div className="flex items-center justify-center h-full">
                    <div>
                      <div className="text-center">
                        {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                      </div>
                      <div>
                        <div className="loader"></div>
                      </div>
                    </div>
                  </div>
                )
              }
            />
          </div>
        )}
        {device === "tablet" && (
          <div
            className="max-h-full w-auto"
            style={{ aspectRatio: "3 / 4", height: "100%", maxWidth: "100%" }}
          >
            <FreestyleDevServer
              ref={devServerRef}
              actions={{ requestDevServer }}
              repoId={props.repo}
              loadingComponent={({ iframeLoading, devCommandRunning }) =>
                !devCommandRunning && (
                  <div className="flex items-center justify-center h-full">
                    <div>
                      <div className="text-center">
                        {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                      </div>
                      <div>
                        <div className="loader"></div>
                      </div>
                    </div>
                  </div>
                )
              }
            />
          </div>
        )}
        {device === "phone" && (
          <div
            className="max-h-full w-auto"
            style={{ aspectRatio: "9 / 19.5", height: "100%", maxWidth: "100%" }}
          >
            <FreestyleDevServer
              ref={devServerRef}
              actions={{ requestDevServer }}
              repoId={props.repo}
              loadingComponent={({ iframeLoading, devCommandRunning }) =>
                !devCommandRunning && (
                  <div className="flex items-center justify-center h-full">
                    <div>
                      <div className="text-center">
                        {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                      </div>
                      <div>
                        <div className="loader"></div>
                      </div>
                    </div>
                  </div>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
