"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { mintNft } from "@/actions/mint-nft";
import { createMintologyProject } from "@/actions/create-mintology-project";
import { toast } from "sonner";
import { generateBannerbearImage } from "@/actions/bannerbear-generate";
import { createPremint } from "@/actions/mintology-premints";

export function MintNftModal({ appId, appName, gitRepo, projectId, frameworkName, appDescription, open: externalOpen, onOpenChange }: { appId: string; appName: string; gitRepo?: string; projectId?: string; frameworkName?: string; appDescription?: string; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
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
  const [resolvedProjectId, setResolvedProjectId] = useState<string | null>(null);
  const effectiveProjectId = projectId || (process.env.NEXT_PUBLIC_MINTOLOGY_PROJECT_ID as string) || "";

  console.log("MintNftModal rendered:", { appId, appName, open, step, frameworkName });

  function resolveFrameworkLogoUrl(framework?: string): string | undefined {
    if (!framework) return undefined;
    
    // Use external CDN URLs for Bannerbear compatibility
    const f = framework.toLowerCase();
    if (f.includes("next")) return "https://cdn.worldvectorlogo.com/logos/next-js.svg";
    if (f.includes("vite")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/1200px-Vitejs-logo.svg.png";
    if (f.includes("expo")) return "https://www.cdnlogo.com/logos/e/67/expo.svg";
    
    return undefined;
  }

  async function preparePremint(): Promise<boolean> {
    setPreparing(true);
    setStep("prepare");
    try {
      // 0) Resolve/ensure project first (avoid doing expensive image work if project will fail)
      let projectIdToUse = effectiveProjectId;
      if (!projectIdToUse) {
        toast.message("Creating Mintology project...");
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
          return false;
        }
        const created = (createRes as any).data;
        projectIdToUse = created?.data?.project_id || created?.project_id || created?.projectId || "";
        if (!projectIdToUse) {
          toast.error("Could not resolve created project ID");
          return false;
        }
        toast.success("Mintology project ready");
      }
      setResolvedProjectId(projectIdToUse);

      // 1) Generate image via Bannerbear (no screenshot needed)
      toast.message("Generating Bannerbear image...");
      
      // Prepare all the data for Bannerbear with proper defaults
      const bannerbearParams = {
        templateId: "qY4mReZp3VAeb97lP8",
        appName: appName || "Unnamed App",
        appDescription: appDescription || `A web application created with ${frameworkName || 'modern framework'}`,
        appId,
        gitRepo: gitRepo || undefined,
        frameworkName: frameworkName || "Web App",
        featuresSummary: "Modern web application with responsive design and user-friendly interface",
        frameworkLogoUrl: resolveFrameworkLogoUrl(frameworkName),
        logoUrl: undefined, // We don't have a custom logo
        barCodeData: appId, // Use app ID as barcode data for uniqueness
        dateCreatedIso: new Date().toISOString(),
      };
      
      console.log("Bannerbear params:", bannerbearParams);
      
      const bb = await generateBannerbearImage(bannerbearParams);
      if (!bb.ok) {
        console.error("Bannerbear failed:", bb.error);
        toast.error(bb.error || "Bannerbear failed");
        return false;
      }
      const url = bb.data.imageUrl;
      setImageUrl(url);

      // 2) Build metadata (ensure required fields)
      let metadata: any | undefined = undefined;
      if (metadataJson.trim()) {
        try {
          metadata = JSON.parse(metadataJson);
        } catch {
          toast.error("Invalid metadata JSON");
          return false;
        }
      }
      if (!metadata) metadata = {};
      // Required by Mintology
      metadata.name = metadata.name || appName;
      metadata.image = metadata.image || url;
      // Nice-to-have fields
      metadata.description = metadata.description || appDescription || `NFT of app: ${appName} (${appId})`;
      metadata.title = metadata.title || metadata.name;
      metadata.subtitle = metadata.subtitle || metadata.description;
      // Standardize attributes
      const attrs: Array<{ trait_type: string; value: string }> = Array.isArray(metadata.attributes) ? metadata.attributes : [];
      const ensureAttr = (trait: string, value?: string) => {
        if (!value) return;
        if (!attrs.find((a) => a?.trait_type === trait)) attrs.push({ trait_type: trait, value });
      };
      ensureAttr("app_id", appId);
      ensureAttr("git_repo", gitRepo || undefined);
      ensureAttr("framework_name", frameworkName || undefined);
      ensureAttr("created_at", new Date().toISOString());
      metadata.attributes = attrs;

      // 3) Create premint (quantity 1)
      toast.message("Creating premint...");
      const premint = await createPremint({ projectId: projectIdToUse!, quantity: 1, metadata });
      if (!premint.ok) {
        toast.error(premint.error || "Premint failed");
        return false;
      }
      const pid = premint.data?.data?.premint_id || premint.data?.premint_id;
      if (!pid) {
        toast.error("No premint_id returned");
        return false;
      }
      setPremintId(pid);
      toast.success("Premint ready");
      setStep("ready");
      return true;
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

      // Resolve project ID: prefer the one we created/resolved during preparation
      let projectIdToUse = resolvedProjectId || effectiveProjectId;
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
        projectIdToUse = created?.data?.project_id || created?.project_id || created?.projectId || "";
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

  // Prepare premint when modal opens
  useEffect(() => {
    console.log("Modal state changed:", { open, step, preparing });
    if (open && step === "prepare") {
      console.log("Starting preparation...");
      preparePremint();
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dialog open change:", newOpen);
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary" disabled={preparing}>
            {preparing ? "Preparing..." : "Mint as NFT"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mint “{appName}” as NFT</DialogTitle>
          <DialogDescription>
            Mint your app as an NFT on the Mintology platform. This will create a unique digital asset representing your application.
          </DialogDescription>
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

