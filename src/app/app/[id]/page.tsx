"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppWrapper from "../../../components/app-wrapper-simple";
import { UIMessage } from "ai";
import { RecreateButton } from "@/components/recreate-button";
import { getAppMessages } from "@/actions/get-app-messages";
import { requestDevServer } from "@/actions/request-dev-server";

interface AppInfo {
  id: string;
  name: string;
  gitRepo: string;
  is_public: boolean;
  baseId: string;
  previewDomain?: string;
  is_recreatable: boolean;
  requires_subscription: boolean;
  stripeProductId?: string;
  userId: string;
}

export default function AppPage() {
  const params = useParams();
  const { user, profile, loading } = useAuth();
  const [app, setApp] = useState<AppInfo | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState("");
  const [ephemeralUrl, setEphemeralUrl] = useState("");
  const [uiMessages, setUiMessages] = useState<UIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    const loadApp = async () => {
      if (loading) return;

      try {
        setAppLoading(true);
        
        // Prepare headers for authentication
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add user ID header if user is authenticated
        if (user?.uid) {
          headers['x-user-id'] = user.uid;
        }
        
        // Fetch app data from API
        const response = await fetch(`/api/apps/${id}`, {
          headers,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load app");
        }
        
        const appData = await response.json();
        setApp(appData);

        // Load UI messages using server action
        try {
          const messages = await getAppMessages(id);
          setUiMessages(messages);
        } catch (error) {
          console.error("Error loading messages:", error);
          setUiMessages([]);
        }

        // Request dev server using server action
        if (appData.gitRepo) {
          try {
            const devServerResult = await requestDevServer(appData.gitRepo);
            if (devServerResult.success) {
              setCodeServerUrl(devServerResult.codeServerUrl || "");
              setEphemeralUrl(devServerResult.ephemeralUrl || "");
            } else {
              console.error("Dev server request failed:", devServerResult.error);
            }
          } catch (error) {
            console.error("Dev server request failed:", error);
            // Allow page to render; client WebView can recover/request later
          }
        }

      } catch (error) {
        console.error("Error loading app:", error);
        setError(error instanceof Error ? error.message : "App not found or you don't have permission to access it");
      } finally {
        setAppLoading(false);
      }
    };

    loadApp();
  }, [id, loading, user]);

  // Show loading while auth is loading or app is loading
  if (loading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {loading ? "Checking authentication..." : "Loading app..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error if app not found or no permission
  if (error || !app) {
    return (
      <div className="text-center my-16">
        <p className="text-lg font-semibold mb-4">
          {error || "Project not found or you don't have permission to access it."}
        </p>
        <div className="flex justify-center mt-4">
          <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Go back to home
          </a>
        </div>
      </div>
    );
  }

  // Check if user has permission to access this app
  const isOwner = user && app.userId === user.uid;
  const isPublic = app.is_public;
  
  if (!isPublic && !isOwner) {
    return (
      <div className="text-center my-16">
        <p className="text-lg font-semibold mb-4">
          You don't have permission to access this project.
        </p>
        <div className="flex justify-center mt-4">
          <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Go back to home
          </a>
        </div>
      </div>
    );
  }

  const showRecreate = app.is_recreatable && !isOwner;

  return (
    <AppWrapper
      baseId={app.baseId || ""}
      codeServerUrl={codeServerUrl}
      appName={app.name || ""}
      initialMessages={uiMessages}
      consoleUrl={ephemeralUrl ? ephemeralUrl + "/__console" : ""}
      repo={app.gitRepo || ""}
      appId={app.id || ""}
      repoId={app.gitRepo || ""}
      domain={app.previewDomain ?? undefined}
      running={false}
      showRecreate={showRecreate}
      sourceAppId={app.id || ""}
      isPublic={isPublic}
      isOwner={isOwner}
      isRecreatable={app.is_recreatable || false}
      isCrowdfunded={!!app.stripeProductId}
      stripeProductId={app.stripeProductId ?? undefined}
      requiresSubscription={app.requires_subscription || false}
      isSubscriber={false} // TODO: Implement subscription logic
      authToken={user ? "client-side-auth" : undefined}
      topBarActions={
        showRecreate && app.id ? (
          <RecreateButton sourceAppId={app.id} />
        ) : null
      }
    />
  );
}
