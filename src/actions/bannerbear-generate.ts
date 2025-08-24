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
}

export async function generateBannerbearImage(params: GenerateBannerbearParams) {
  const apiKey = process.env.BANNERBEAR_API_KEY;
  // default to provided UID if not set via param/env
  const templateId = params.templateId || process.env.BANNERBEAR_TEMPLATE_ID || "qY4mReZp3VAeb97lP8";
  if (!apiKey) return { ok: false, error: "BANNERBEAR_API_KEY not set" } as const;
  if (!templateId) return { ok: false, error: "BANNERBEAR_TEMPLATE_ID not set" } as const;

  try {
    // 1) Validate template exists and (optionally) inspect available_modifications
    const tplRes = await fetch(`https://api.bannerbear.com/v2/templates/${encodeURIComponent(templateId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!tplRes.ok) {
      const tdata = await tplRes.json().catch(() => ({}));
      return { ok: false, error: tdata?.error || tdata?.message || `Template ${templateId} not found (${tplRes.status})`, data: tdata } as const;
    }
    const template = await tplRes.json().catch(() => ({}));

    // 2) Build modifications according to provided names
    const mods: any[] = [];
    mods.push({ name: "app_name", text: params.appName });
    if (params.frameworkName) mods.push({ name: "framework_name", text: params.frameworkName });
    if (params.featuresSummary) mods.push({ name: "features_summary", text: params.featuresSummary });
    if (params.appDescription) mods.push({ name: "app_description", text: params.appDescription });
    if (params.gitRepo) mods.push({ name: "git_repo", text: params.gitRepo });
    if (params.dateCreatedIso) mods.push({ name: "date_created", text: params.dateCreatedIso });
    if (params.frameworkLogoUrl) mods.push({ name: "framework_logo", image_url: params.frameworkLogoUrl });
    if (params.logoUrl) mods.push({ name: "logo", image_url: params.logoUrl });
    if (params.barCodeData != null) mods.push({ name: "bar_code", bar_code_data: params.barCodeData });

    const body = {
      template: templateId,
      synchronous: true,
      modifications: mods,
      transparent: false,
      metadata: null,
    } as any;

    const res = await fetch("https://api.bannerbear.com/v2/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || data?.message || `Bannerbear error: ${res.status}`, data } as const;
    }

    // Bannerbear returns different url props depending on template; normalize
    const imageUrl: string | undefined = data?.image_url || data?.image_url_png || data?.image?.url;
    if (!imageUrl) {
      return { ok: false, error: "Bannerbear did not return an image_url", data } as const;
    }

    return { ok: true, data: { imageUrl, raw: data, template } } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}
