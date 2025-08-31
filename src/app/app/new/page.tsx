"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createApp } from "@/actions/create-app";

export default function NewAppRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleAppCreation = async () => {
      if (loading) return; // Wait for auth to load

      if (!user) {
        // User is not authenticated, redirect to home with sign-in prompt
        const message = searchParams.get("message") || "";
        const template = searchParams.get("template") || "nextjs";
        const redirectUrl = `/?message=${encodeURIComponent(message)}&template=${template}&signin=true`;
        console.log("User not authenticated, redirecting to:", redirectUrl);
        router.replace(redirectUrl);
        return;
      }

      if (isCreating) return; // Prevent multiple creations
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
        router.replace(redirectUrl);
      }
    };

    handleAppCreation();
  }, [user, loading, searchParams, router, isCreating]);

  // Show loading while checking authentication or creating app
  if (loading || isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {loading ? "Checking authentication..." : "Creating your app..."}
          </p>
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
