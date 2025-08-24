"use server";

interface GenerateBannerbearParams {
  templateId?: string; // falls back to env
  name: string;
  subtitle?: string;
  appId: string;
  repo?: string;
  emoji?: string;
}

export async function generateBannerbearImage(params: GenerateBannerbearParams) {
  const apiKey = process.env.BANNERBEAR_API_KEY;
  const templateId = params.templateId || process.env.BANNERBEAR_TEMPLATE_ID;
  if (!apiKey) return { ok: false, error: "BANNERBEAR_API_KEY not set" } as const;
  if (!templateId) return { ok: false, error: "BANNERBEAR_TEMPLATE_ID not set" } as const;

  try {
    const body = {
      template: templateId,
      // ask Bannerbear to wait for completion
      synchronous: true,
      modifications: [
        { name: "title", text: params.name },
        ...(params.subtitle ? [{ name: "subtitle", text: params.subtitle }] : []),
        ...(params.emoji ? [{ name: "emoji", text: params.emoji }] : []),
        { name: "app_id", text: params.appId },
        ...(params.repo ? [{ name: "repo", text: params.repo }] : []),
      ],
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

    return { ok: true, data: { imageUrl, raw: data } } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}
