"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { mintNft } from "@/actions/mint-nft";
import { toast } from "sonner";

export function MintNftModal({ appId, appName, projectId }: { appId: string; appName: string; projectId?: string }) {
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [metadataJson, setMetadataJson] = useState(
    `{
  "name": "${appName}",
  "description": "NFT of app: ${appName} (${appId})"
}`
  );
  const [submitting, setSubmitting] = useState(false);
  const effectiveProjectId = projectId || (process.env.NEXT_PUBLIC_MINTOLOGY_PROJECT_ID as string) || "";

  async function onMint() {
    setSubmitting(true);
    try {
      let metadata: any | undefined = undefined;
      if (metadataJson.trim()) {
        try {
          metadata = JSON.parse(metadataJson);
        } catch (e) {
          toast.error("Invalid metadata JSON");
          return;
        }
      }

      const res = await mintNft({ projectId: effectiveProjectId, wallet_address: wallet || undefined, email: email || undefined, metadata });
      if (!res.ok) {
        toast.error(res.error || "Mint failed");
      } else {
        toast.success("Mint request sent");
        setOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={!effectiveProjectId}>
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mint “{appName}” as NFT</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!effectiveProjectId && (
            <div className="text-sm text-red-600">Missing Mintology project ID. Set NEXT_PUBLIC_MINTOLOGY_PROJECT_ID or pass projectId prop.</div>
          )}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Wallet address (or email)</label>
            <Input placeholder="0x..." value={wallet} onChange={(e) => setWallet(e.target.value)} />
            <div className="text-xs text-muted-foreground">Alternatively provide an email to mint to a Mintable Wallet.</div>
            <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Metadata (JSON, optional)</label>
            <Textarea rows={6} value={metadataJson} onChange={(e) => setMetadataJson(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={onMint} disabled={submitting || (!wallet && !email)}>
            {submitting ? "Minting..." : "Mint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
