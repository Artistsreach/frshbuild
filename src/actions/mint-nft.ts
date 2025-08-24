"use server";

interface MintNftParams {
  projectId: string;
  wallet_address?: string;
  email?: string;
  metadata?: Record<string, any>;
  premint_id?: string;
}

export async function mintNft({ projectId, wallet_address, email, metadata, premint_id }: MintNftParams) {
  if (!projectId) {
    return { ok: false, error: "projectId is required" };
  }
  if (!wallet_address && !email) {
    return { ok: false, error: "Either wallet_address or email is required" };
  }

  const apiKey = process.env.MINTOLOGY_API_KEY;
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  if (!apiKey) {
    return { ok: false, error: "MINTOLOGY_API_KEY is not set on the server" };
  }

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(projectId)}/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        ...(wallet_address ? { wallet_address } : {}),
        ...(email ? { email } : {}),
        ...(metadata ? { metadata } : {}),
        ...(premint_id ? { premint_id } : {}),
      }),
      // Extra safeguard for server-only
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error || data?.message || `Mintology error: ${res.status}`,
        data,
      };
    }

    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" };
  }
}

