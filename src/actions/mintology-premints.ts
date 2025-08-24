"use server";

interface PremintMetadata {
  name: string;
  image: string;
  description?: string;
  animation_url?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  // extra fields allowed by Mintology
  [k: string]: any;
}

export async function listPremints(projectId: string) {
  const apiKey = process.env.MINTOLOGY_API_KEY;
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  if (!apiKey) return { ok: false, error: "MINTOLOGY_API_KEY is not set on the server" } as const;
  if (!projectId) return { ok: false, error: "projectId is required" } as const;

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(projectId)}/premints`, {
      method: "GET",
      headers: { "Api-Key": apiKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || data?.message || `Mintology error: ${res.status}`, data } as const;
    return { ok: true, data } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}

export async function createPremint(params: {
  projectId: string;
  quantity: number;
  metadata: PremintMetadata;
  premint_id?: string;
}) {
  const apiKey = process.env.MINTOLOGY_API_KEY;
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  if (!apiKey) return { ok: false, error: "MINTOLOGY_API_KEY is not set on the server" } as const;
  if (!params.projectId) return { ok: false, error: "projectId is required" } as const;
  if (!params.quantity) return { ok: false, error: "quantity is required" } as const;
  if (!params.metadata) return { ok: false, error: "metadata is required" } as const;

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(params.projectId)}/premints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        quantity: params.quantity,
        metadata: params.metadata,
        ...(params.premint_id ? { premint_id: params.premint_id } : {}),
      }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || data?.message || `Mintology error: ${res.status}`, data } as const;
    return { ok: true, data } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}

export async function getPremint(params: { projectId: string; premintId: string }) {
  const apiKey = process.env.MINTOLOGY_API_KEY;
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  if (!apiKey) return { ok: false, error: "MINTOLOGY_API_KEY is not set on the server" } as const;
  if (!params.projectId) return { ok: false, error: "projectId is required" } as const;
  if (!params.premintId) return { ok: false, error: "premintId is required" } as const;

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(params.projectId)}/premints/${encodeURIComponent(params.premintId)}`, {
      method: "GET",
      headers: { "Api-Key": apiKey },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || data?.message || `Mintology error: ${res.status}`, data } as const;
    return { ok: true, data } as const;
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" } as const;
  }
}
