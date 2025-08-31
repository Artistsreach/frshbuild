"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createApp } from "@/actions/create-app";

export default function NewAppRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleAppCreation = async () => {
      console.log("App creation flow started:", { 
        loading, 
        user: user ? { uid: user.uid, email: user.email } : null,
        profile: profile ? { uid: profile.uid, freestyleIdentity: profile.freestyleIdentity } : null,
        isCreating 
      });

      if (loading) {
        console.log("Still loading auth state...");
        return; // Wait for auth to load
      }

      if (!user) {
        // User is not authenticated, redirect to home with sign-in prompt
        const message = searchParams.get("message") || "";
        const template = searchParams.get("template") || "nextjs";
        const redirectUrl = `/?message=${encodeURIComponent(message)}&template=${template}&signin=true`;
        console.log("User not authenticated, redirecting to:", redirectUrl);
        router.replace(redirectUrl);
        return;
      }

      if (!profile) {
        // Profile is still loading, wait a bit more
        console.log("Profile still loading, waiting...");
        return;
      }

      if (!profile.freestyleIdentity) {
        // User doesn't have freestyleIdentity yet, show loading
        console.log("User doesn't have freestyleIdentity yet, waiting for it to be created...");
        return;
      }

      if (isCreating) {
        console.log("Already creating app, skipping...");
        return; // Prevent multiple creations
      }

      console.log("Starting app creation for user:", user.uid);
      setIsCreating(true);

      try {
        // Extract message safely
        const rawMessage = searchParams.get("message");
        const message = rawMessage ?? undefined;
        const template = searchParams.get("template") || "nextjs";

        console.log("Creating app with:", { message, template, userId: user.uid });

        const { id } = await createApp({
          initialMessage: message,
          templateId: template,
          userId: user.uid,
        });

        console.log("App created successfully, redirecting to:", `/app/${id}`);
        router.replace(`/app/${id}`);
      } catch (error) {
        console.error("Error creating app:", error);
        setIsCreating(false);
        
        // Redirect back to home page with error
        const message = searchParams.get("message") || "";
        const template = searchParams.get("template") || "nextjs";
        const redirectUrl = `/?message=${encodeURIComponent(message)}&template=${template}&error=true`;
        console.log("Redirecting to home with error:", redirectUrl);
        router.replace(redirectUrl);
      }
    };

    handleAppCreation();
  }, [user, profile, loading, searchParams, router, isCreating]);

  // Show loading while checking authentication, waiting for profile, or creating app
  if (loading || !profile || !profile.freestyleIdentity || isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {loading ? "Checking authentication..." : 
             !profile ? "Loading profile..." :
             !profile.freestyleIdentity ? "Setting up your development environment..." :
             "Creating your app..."}
          </p>
          {loading && (
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we verify your authentication...
            </p>
          )}
          {!profile && !loading && (
            <p className="mt-2 text-sm text-muted-foreground">
              Loading your profile...
            </p>
          )}
          {profile && !profile.freestyleIdentity && (
            <p className="mt-2 text-sm text-muted-foreground">
              Setting up your development environment...
            </p>
          )}
          {isCreating && (
            <p className="mt-2 text-sm text-muted-foreground">
              Setting up your development environment...
            </p>
          )}
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
