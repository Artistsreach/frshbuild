"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { mintNft } from "@/actions/mint-nft";
import { createMintologyProject } from "@/actions/create-mintology-project";
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
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [includeImage, setIncludeImage] = useState(true);
  const effectiveProjectId = projectId || (process.env.NEXT_PUBLIC_MINTOLOGY_PROJECT_ID as string) || "";

  async function captureScreenshot() {
    setCapturing(true);
    try {
      const fn = (window as any).captureAppScreenshot as undefined | (() => Promise<string | null>);
      if (!fn) {
        toast.error("Screenshot function not available. Open the app preview to enable it.");
        return;
      }
      const dataUrl = await fn();
      if (!dataUrl) {
        toast.error("Failed to capture screenshot");
        return;
      }
      setScreenshot(dataUrl);
      // Save as current app thumbnail as well
      try {
        await fetch(`/api/apps/${appId}/thumbnail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
      } catch {}
      toast.success("Screenshot captured");
    } finally {
      setCapturing(false);
    }
  }

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

      // If requested, embed screenshot as image if not already provided
      if (includeImage && screenshot) {
        if (!metadata) metadata = {};
        if (!metadata.image) {
          metadata.image = screenshot;
        }
      }
      }

      // Resolve project ID: use provided or env; otherwise create a new project first
      let projectIdToUse = effectiveProjectId;
      if (!projectIdToUse) {
        const createRes = await createMintologyProject({
          name: appName,
          description: `Project for app ${appName} (${appId})`,
          contract_type: "Shared",
          wallet_type: "Both",
          network: 1,
          chain: "eth",
        });
        if (!createRes.ok) {
          toast.error(createRes.error || "Failed to create project");
          return;
        }
        const created = (createRes as any).data;
        projectIdToUse = created?.data?.project_id || created?.project_id || "";
        if (!projectIdToUse) {
          toast.error("Could not resolve created project ID");
          return;
        }
        toast.success("Created Mintology project");
      }

      const res = await mintNft({ projectId: projectIdToUse, wallet_address: wallet || undefined, email: email || undefined, metadata });
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
        <Button size="sm" variant="secondary">
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mint “{appName}” as NFT</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!effectiveProjectId && (
            <div className="text-sm text-amber-600">No project ID configured. We will create a Shared project automatically before minting.</div>
          )}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Wallet address (or email)</label>
            <Input placeholder="0x..." value={wallet} onChange={(e) => setWallet(e.target.value)} />
            <div className="text-xs text-muted-foreground">Alternatively provide an email to mint to a Mintable Wallet.</div>
            <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Screenshot</label>
              <div className="flex items-center gap-3">
                <label className="text-xs flex items-center gap-1 cursor-pointer select-none">
                  <input type="checkbox" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)} />
                  Include in metadata.image
                </label>
                <Button size="sm" variant="outline" onClick={captureScreenshot} disabled={capturing}>
                  {capturing ? "Capturing..." : "Capture screenshot"}
                </Button>
              </div>
            </div>
            {screenshot && (
              <div className="border rounded p-2">
                <img src={screenshot} alt="Screenshot preview" className="max-h-48 object-contain mx-auto" />
              </div>
            )}
            {!screenshot && (
              <div className="text-xs text-muted-foreground">Click "Capture screenshot" while the app preview is visible to grab an image.</div>
            )}
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
