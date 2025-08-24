"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { mintNft } from "@/actions/mint-nft";
import { createMintologyProject } from "@/actions/create-mintology-project";
import { toast } from "sonner";
import { getStorage as getFirebaseStorage } from "@/lib/firebase";
import { ref as fbRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [includeImage, setIncludeImage] = useState(true);
  const effectiveProjectId = projectId || (process.env.NEXT_PUBLIC_MINTOLOGY_PROJECT_ID as string) || "";

  // Removed auto-capture on open to avoid the modal overlay in screenshots.

  async function captureScreenshot() {
    setCapturing(true);
    try {
      const h2c = (window as any).html2canvas as undefined | ((node: HTMLElement, opts?: any) => Promise<HTMLCanvasElement | null>);
      let dataUrl: string | null = null;

      // 1) Try capturing the entire application viewport first
      if (h2c) {
        const root = document.body as HTMLElement;
        const canvas = await h2c(root, {
          backgroundColor: null,
          useCORS: true,
          scale: 1,
          logging: false,
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
        });
        if (canvas) dataUrl = canvas.toDataURL("image/webp", 0.9);
      }

      // 2) Fallback: use the helper exposed by WebView (captures preview container)
      if (!dataUrl) {
        const fn = (window as any).captureAppScreenshot as undefined | (() => Promise<string | null>);
        if (fn) {
          dataUrl = await fn();
        }
      }

      // 3) Fallback: capture the preview container directly
      if (!dataUrl && h2c) {
        const el = document.getElementById("app-preview-container");
        if (el) {
          const canvas = await h2c(el as HTMLElement, {
            backgroundColor: null,
            useCORS: true,
            scale: 0.8,
            logging: false,
            windowWidth: (el as HTMLElement).clientWidth,
            windowHeight: (el as HTMLElement).clientHeight,
          });
          if (canvas) dataUrl = canvas.toDataURL("image/webp", 0.9);
        }
      }
      if (!dataUrl) {
        toast.error("Failed to capture screenshot. Make sure the preview is visible on this page.");
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
      // Upload to Firebase Storage and store public URL
      try {
        const storage = getFirebaseStorage();
        if (!storage) {
          toast.error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
        } else {
          const path = `apps/${appId}/screenshots/${Date.now()}.webp`;
          const blob = await (await fetch(dataUrl)).blob();
          const r = fbRef(storage, path);
          await uploadBytes(r, blob, { contentType: "image/webp" });
          const url = await getDownloadURL(r);
          setScreenshotUrl(url);
          toast.success("Screenshot uploaded");
        }
      } catch (e) {
        console.debug("upload failed", e);
        // non-blocking
      }
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
      if (includeImage && (screenshotUrl || screenshot)) {
        if (!metadata) metadata = {};
        if (!metadata.image) {
          metadata.image = screenshotUrl || screenshot;
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

  // Capture the page before opening the modal so the modal overlay is not included
  async function openModalWithPreCapture() {
    await captureScreenshot();
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="secondary" onClick={openModalWithPreCapture} disabled={capturing}>
        {capturing ? "Preparing..." : "Mint as NFT"}
      </Button>
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
            {(screenshotUrl || screenshot) ? (
              <div className="border rounded p-2 space-y-2">
                <img src={screenshotUrl || screenshot || undefined} alt="Screenshot preview" className="max-h-48 object-contain mx-auto" />
                {screenshotUrl && (
                  <div className="text-xs text-muted-foreground break-all text-center">
                    Uploaded URL: <a className="underline" href={screenshotUrl} target="_blank" rel="noreferrer">{screenshotUrl}</a>
                  </div>
                )}
              </div>
            ) : (
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
