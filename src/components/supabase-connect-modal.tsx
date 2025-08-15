"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupabaseConnectModal({ open, onOpenChange }: Props) {
  const [pat, setPat] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const docsHref = "/supabase-management-api.md";

  const authorizeHref = useMemo(() => {
    return "/api/supabase/oauth/authorize";
  }, []);

  async function onSavePat() {
    try {
      setSaving(true);
      setError(null);
      setSaved(null);
      const res = await fetch("/api/supabase/save-pat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pat }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed: ${res.status}`);
      }
      setSaved("Personal Access Token saved. You can now access your Supabase projects.");
      setPat("");
    } catch (e: any) {
      setError(e?.message || "Failed to save token");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Supabase</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-4">
          <p>
            Connect your Supabase account so the app and agent can manage your organizations and projects. See
            <a className="underline ml-1" href={docsHref} target="_blank" rel="noreferrer">Supabase Management API</a>
            for details.
          </p>

          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="oauth">OAuth (Recommended)</TabsTrigger>
              <TabsTrigger value="pat">Personal Access Token</TabsTrigger>
            </TabsList>
            <TabsContent value="oauth" className="space-y-3 mt-3">
              <p>
                Use OAuth to securely grant access to your Supabase account with fine-grained scopes. You may be asked
                to sign in and approve access.
              </p>
              <Button
                onClick={() => {
                  window.location.href = authorizeHref;
                }}
              >
                Continue with Supabase OAuth
              </Button>
            </TabsContent>
            <TabsContent value="pat" className="space-y-3 mt-3">
              <p>
                Alternatively, paste a Personal Access Token (PAT). PATs have the same privileges as your account—store
                them securely.
              </p>
              <div className="space-y-2">
                <Label htmlFor="supabase-pat">Personal Access Token</Label>
                <Input
                  id="supabase-pat"
                  placeholder="sbp_..."
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {saved && <div className="text-green-600 text-sm">{saved}</div>}
              <div className="flex gap-2">
                <Button disabled={!pat || saving} onClick={onSavePat}>
                  {saving ? "Saving..." : "Save Token"}
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
