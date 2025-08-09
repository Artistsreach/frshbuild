"use client";

import { useEffect } from "react";

export default function ConnectRefreshPage() {
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("/api/stripe/connect/start", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to refresh link");
        if (data.url) window.location.href = data.url;
      } catch (e) {
        console.error(e);
        window.location.href = "/";
      }
    };
    go();
  }, []);

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-medium">Refreshing onboarding session…</h1>
        <p className="text-muted-foreground">Please wait, redirecting you to Stripe.</p>
      </div>
    </main>
  );
}
