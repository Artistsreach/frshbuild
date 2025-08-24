"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { mintNft } from "@/actions/mint-nft";
import { createMintologyProject } from "@/actions/create-mintology-project";
import { toast } from "sonner";
import { generateBannerbearImage } from "@/actions/bannerbear-generate";
import { createPremint } from "@/actions/mintology-premints";

export function MintNftModal({ appId, appName, gitRepo, projectId, frameworkName, appDescription }: { appId: string; appName: string; gitRepo?: string; projectId?: string; frameworkName?: string; appDescription?: string }) {
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [metadataJson, setMetadataJson] = useState(() => {
    const createdAt = new Date().toISOString();
    const base = {
      name: appName,
      description: `NFT of app: ${appName} (${appId})`,
      attributes: [
        { trait_type: "app_id", value: appId },
        ...(gitRepo ? [{ trait_type: "git_repo", value: gitRepo }] : []),
        { trait_type: "created_at", value: createdAt },
      ],
    } as any;
    return JSON.stringify(base, null, 2);
  });
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [premintId, setPremintId] = useState<string | null>(null);
  const [step, setStep] = useState<"prepare" | "ready">("prepare");
  const [isModalReady, setIsModalReady] = useState(false);
  const effectiveProjectId = projectId || (process.env.NEXT_PUBLIC_MINTOLOGY_PROJECT_ID as string) || "";

  useEffect(() => {
    if (isModalReady) {
      setOpen(true);
      setIsModalReady(false); // Reset for next time
    }
  }, [isModalReady]);

  function resolveFrameworkLogoUrl(framework?: string): string | undefined {
    const f = (framework || "").toLowerCase();
    if (f.includes("next")) return "https://seeklogo.com/images/N/next-js-logo-8FCFF51DD2-seeklogo.com.png";
    if (f.includes("vite")) return "https://logospng.org/download/vite-js/vite-js-4096-logo.png";
    if (f.includes("expo")) return "https://seeklogo.com/images/E/expo-logo-FE218B5FF2-seeklogo.com.png";
    return undefined;
  }

  async function preparePremint() {
    setPreparing(true);
    setStep("prepare");
    try {
      // 1) Generate image via Bannerbear
      const bb = await generateBannerbearImage({
        templateId: "qY4mReZp3VAeb97lP8",
        appName,
        appDescription,
        appId,
        gitRepo,
        frameworkName,
        // featuresSummary could be generated asynchronously later; omit if not available
        featuresSummary: undefined,
        frameworkLogoUrl: resolveFrameworkLogoUrl(frameworkName),
        dateCreatedIso: new Date().toISOString(),
      });
      if (!bb.ok) {
        toast.error(bb.error || "Bannerbear failed");
        return;
      }
      const url = bb.data.imageUrl;
      setImageUrl(url);

      // 2) Build metadata (ensure image)
      let metadata: any | undefined = undefined;
      if (metadataJson.trim()) {
        try {
          metadata = JSON.parse(metadataJson);
        } catch {
          toast.error("Invalid metadata JSON");
          return;
        }
      }
      if (!metadata) metadata = {};
      if (!metadata.name) metadata.name = appName;
      if (!metadata.description) metadata.description = `NFT of app: ${appName} (${appId})`;
      if (!metadata.image) metadata.image = url;

      // 3) Ensure projectId
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

      // 4) Create premint (quantity 1)
      const premint = await createPremint({ projectId: projectIdToUse, quantity: 1, metadata });
      if (!premint.ok) {
        toast.error(premint.error || "Premint failed");
        return;
      }
      const pid = premint.data?.data?.premint_id || premint.data?.premint_id;
      if (!pid) {
        toast.error("No premint_id returned");
        return;
      }
      setPremintId(pid);
      toast.success("Premint ready");
      setStep("ready");
    } finally {
      setPreparing(false);
    }
  }

  async function onMint() {
    setSubmitting(true);
    try {
      // For premint flow, we prefer using premint_id; if it doesn't exist, fallback to inline metadata
      let metadata: any | undefined = undefined;
      if (!premintId && metadataJson.trim()) {
        try {
          metadata = JSON.parse(metadataJson);
        } catch {
          toast.error("Invalid metadata JSON");
          return;
        }
        if (imageUrl && !metadata.image) metadata.image = imageUrl;
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

      const res = await mintNft({ projectId: projectIdToUse, wallet_address: wallet || undefined, email: email || undefined, metadata, premint_id: premintId || undefined });
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

  // Prepare premint before opening the modal so it's ready when user sees it
  async function openModalWithPreCapture() {
    await preparePremint();
    setIsModalReady(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="secondary" onClick={openModalWithPreCapture} disabled={preparing}>
        {preparing ? "Preparing..." : "Mint as NFT"}
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
            <label className="text-sm font-medium">Generated Image</label>
            {imageUrl ? (
              <div className="border rounded p-2 space-y-2">
                <img src={imageUrl} alt="Preview" className="max-h-48 object-contain mx-auto" />
                <div className="text-xs text-muted-foreground break-all text-center">
                  URL: <a className="underline" href={imageUrl} target="_blank" rel="noreferrer">{imageUrl}</a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Generating Bannerbear image...</div>
            )}
            {premintId ? (
              <div className="text-xs text-emerald-600">Premint ready: {premintId}</div>
            ) : (
              <div className="text-xs text-muted-foreground">Preparing premint...</div>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Metadata (JSON, optional)</label>
            <Textarea rows={6} value={metadataJson} onChange={(e) => setMetadataJson(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={onMint} disabled={submitting || (!wallet && !email) || step !== "ready"}>
            {submitting ? "Minting..." : step !== "ready" ? "Preparing..." : "Mint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

