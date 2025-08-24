"use server";

interface CreateProjectParams {
  name: string;
  description: string;
  contract_type?: "Shared" | "Dedicated" | "Existing";
  wallet_type?: "Both" | "Custodial" | "NonCustodial";
  network?: number; // 1 mainnet, 11155111 sepolia
  chain?: "eth" | "imx";
  base_uri?: string;
  contract_name?: string;
  symbol?: string;
  royalty?: number;
  total_supply?: number;
  contract_address?: string;
  owner_address?: string;
}

export async function createMintologyProject(params: CreateProjectParams) {
  const apiKey = process.env.MINTOLOGY_API_KEY;
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  if (!apiKey) {
    return { ok: false, error: "MINTOLOGY_API_KEY is not set on the server" };
  }

  const body = {
    name: params.name,
    description: params.description,
    contract_type: params.contract_type ?? "Shared",
    wallet_type: params.wallet_type ?? "Both",
    network: params.network ?? 1,
    chain: params.chain ?? "eth",
    ...(params.base_uri ? { base_uri: params.base_uri } : {}),
    ...(params.contract_name ? { contract_name: params.contract_name } : {}),
    ...(params.symbol ? { symbol: params.symbol } : {}),
    ...(params.royalty != null ? { royalty: params.royalty } : {}),
    ...(params.total_supply != null ? { total_supply: params.total_supply } : {}),
    ...(params.contract_address ? { contract_address: params.contract_address } : {}),
    ...(params.owner_address ? { owner_address: params.owner_address } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || data?.message || `Mintology error: ${res.status}`, data };
    }

    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error" };
  }
}
