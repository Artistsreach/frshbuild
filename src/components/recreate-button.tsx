"use client";

import { Button } from "@/components/ui/button";
import { recreateApp } from "@/actions/recreate-app";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

export function RecreateButton({ sourceAppId, className }: { sourceAppId: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRecreate = async () => {
    try {
      setLoading(true);
      const res = await recreateApp(sourceAppId);
      toast.success("App recreated to your account");
      router.push(`/app/${res.appId}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to recreate app. Please sign in and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleRecreate} disabled={loading} className={className}>
      <CopyIcon className={`h-4 w-4 mr-1 ${loading ? "animate-pulse" : ""}`} />
      {loading ? "Recreating..." : "Recreate"}
    </Button>
  );
}
