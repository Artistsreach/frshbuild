"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { RefreshCwIcon } from "lucide-react";
import { ShareButton } from "./share-button";
import { ModeToggle } from "./theme-toggle";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
  isOwner?: boolean;
  isPublic?: boolean;
  isRecreatable?: boolean;
  requiresSubscription?: boolean;
}) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l transition-opacity duration-700 mt-[2px]">
      <div className="h-12 border-b border-gray-200 dark:border-black items-center flex px-2 bg-background sticky top-0 justify-end gap-2">
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => devServerRef.current?.refresh()}
        >
          <RefreshCwIcon />
        </Button>
        <ModeToggle />
        {props.isOwner && (
          <ShareButton
            domain={props.domain}
            appId={props.appId}
            isPublic={props.isPublic}
            isRecreatable={props.isRecreatable}
            requiresSubscription={props.requiresSubscription}
          />
        )}
      </div>
      <div ref={containerRef} className="h-full">
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
    </div>
  );
}
