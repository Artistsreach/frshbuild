"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";

export interface FirebaseCredits {
  credits: number;
  googleUserId?: string;
  userEmail?: string;
  found: boolean;
}

export function useFirebaseCredits() {
  const [credits, setCredits] = useState<FirebaseCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useUser();

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/firebase-credits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch credits when user changes or component mounts
  useEffect(() => {
    fetchCredits();
  }, [user?.id]);

  const refetch = () => {
    fetchCredits();
  };

  return {
    credits,
    loading,
    error,
    refetch,
    hasGoogleAccount: credits?.found || false,
  };
}
