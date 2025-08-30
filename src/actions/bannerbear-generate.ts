"use server";

interface GenerateBannerbearParams {
  templateId?: string; // defaults to env or hardcoded UID
  appName: string; // maps to app_name
  appDescription?: string; // maps to app_description
  appId: string; // for traceability (not a layer by default)
  gitRepo?: string; // maps to git_repo
  frameworkName?: string; // maps to framework_name
  featuresSummary?: string; // maps to features_summary
  frameworkLogoUrl?: string; // maps to framework_logo
  logoUrl?: string; // maps to logo
  barCodeData?: string | number; // maps to bar_code
  dateCreatedIso?: string; // maps to date_created
  projectId?: string; // required if using a Master API Key (full access)
}

export async function generateBannerbearImage(params: GenerateBannerbearParams) {
  const apiKey = process.env.BANNERBEAR_API_KEY;
  // default to provided UID if not set via param/env
  const templateId = params.templateId || process.env.BANNERBEAR_TEMPLATE_ID || "qY4mReZp3VAeb97lP8";
  if (!apiKey) return { ok: false, error: "BANNERBEAR_API_KEY not set" } as const;
  if (!templateId) return { ok: false, error: "BANNERBEAR_TEMPLATE_ID not set" } as const;

  try {
    console.log("Bannerbear: Starting image generation for template:", templateId);
    
    // Optional: sanity check auth to surface invalid key / wrong project quickly
    try {
      const authRes = await fetch("https://api.bannerbear.com/v2/auth", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      if (!authRes.ok) {
        const adata = await authRes.json().catch(() => ({}));
        console.error("Bannerbear auth failed:", authRes.status, adata);
        return { ok: false, error: adata?.message || `Bannerbear auth failed (${authRes.status})`, data: adata } as const;
      }
      console.log("Bannerbear: Auth successful");
    } catch (error) {
      console.warn("Bannerbear: Auth check failed, continuing anyway:", error);
    }
    
    // 1) Validate template exists and (optionally) inspect available_modifications
    const tplRes = await fetch(`https://api.bannerbear.com/v2/templates/${encodeURIComponent(templateId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!tplRes.ok) {
      const tdata = await tplRes.json().catch(() => ({}));
      console.error("Bannerbear template not found:", templateId, tdata);
      return { ok: false, error: tdata?.error || tdata?.message || `Template ${templateId} not found (${tplRes.status})`, data: tdata } as const;
    }
    const template = await tplRes.json().catch(() => ({}));
    console.log("Bannerbear: Template validated:", template.name || templateId);

    // 2) Build modifications according to template requirements
    const mods: any[] = [];
    
    // Required text fields
    mods.push({ 
      name: "app_name", 
      text: params.appName || "Unnamed App",
      color: null,
      background: null
    });
    
    if (params.frameworkName) {
      mods.push({ 
        name: "framework_name", 
        text: params.frameworkName,
        color: null,
        background: null
      });
    }
    
    if (params.featuresSummary) {
      mods.push({ 
        name: "features_summary", 
        text: params.featuresSummary,
        color: null,
        background: null
      });
    }
    
    if (params.appDescription) {
      mods.push({ 
        name: "app_description", 
        text: params.appDescription,
        color: null,
        background: null
      });
    }
    
    if (params.gitRepo) {
      mods.push({ 
        name: "git_repo", 
        text: params.gitRepo,
        color: null,
        background: null
      });
    }
    
    if (params.dateCreatedIso) {
      mods.push({ 
        name: "date_created", 
        text: params.dateCreatedIso,
        color: null,
        background: null
      });
    }
    
    // Image fields
    if (params.frameworkLogoUrl) {
      mods.push({ 
        name: "framework_logo", 
        image_url: params.frameworkLogoUrl
      });
    }
    
    if (params.logoUrl) {
      mods.push({ 
        name: "logo", 
        image_url: params.logoUrl
      });
    }
    
    // Barcode field
    if (params.barCodeData != null) {
      mods.push({ 
        name: "bar_code", 
        bar_code_data: params.barCodeData
      });
    }

    const body = {
      template: templateId,
      modifications: mods,
      webhook_url: null,
      transparent: false,
      metadata: null,
      // When using a Full Access Master API Key we must include project_id
      ...(params.projectId || process.env.BANNERBEAR_PROJECT_ID
        ? { project_id: params.projectId || process.env.BANNERBEAR_PROJECT_ID }
        : {}),
    };

    console.log("Bannerbear: Request body:", JSON.stringify(body, null, 2));

    // Use the sync base URL to avoid hanging and get a final image within 10s
    const res = await fetch("https://sync.api.bannerbear.com/v2/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    console.log("Bannerbear: Response status:", res.status);
    console.log("Bannerbear: Response data:", JSON.stringify(data, null, 2));
    
    if (!res.ok) {
      const errMsg = data?.error || data?.message || (res.status === 408 ? "Bannerbear sync timeout (10s)" : `Bannerbear error: ${res.status}`);
      console.error("Bannerbear generation failed:", errMsg, data);
      return { ok: false, error: errMsg, data } as const;
    }

    // Bannerbear returns different url props depending on template; normalize
    const imageUrl: string | undefined = data?.image_url || data?.image_url_png || data?.image?.url;
    if (!imageUrl) {
      console.error("Bannerbear did not return an image_url:", data);
      return { ok: false, error: "Bannerbear did not return an image_url", data } as const;
    }

    console.log("Bannerbear: Image generated successfully:", imageUrl);
    return { ok: true, data: { imageUrl, raw: data, template } } as const;
  } catch (err: any) {
    console.error("Bannerbear generation error:", err);
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}
