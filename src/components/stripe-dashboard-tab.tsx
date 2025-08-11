"use client";

import { useEffect } from "react";

export default function StripeDashboardTab() {
  useEffect(() => {
    try {
      window.open("https://dashboard.stripe.com/", "_blank", "noopener,noreferrer");
    } catch (err) {
      // noop
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        We attempted to open the Stripe Dashboard in a new tab.
      </p>
      <a
        href="https://dashboard.stripe.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        Open Stripe Dashboard
      </a>
    </div>
  );
}


