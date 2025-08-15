import "server-only";
import { stackServerApp } from "@/auth/stack-auth";

export async function getSupabaseToken(): Promise<null | { scheme: string; token: string }> {
  const user = await stackServerApp.getUser();
  if (!user) return null;
  const meta = user.serverMetadata as any;

  // Prefer OAuth access token
  const oauth = meta?.supabaseOAuth as
    | { access_token?: string; token_type?: string }
    | undefined;
  if (oauth?.access_token) {
    return { scheme: oauth.token_type || "Bearer", token: oauth.access_token };
  }

  // Fallback to PAT
  const pat = meta?.supabasePat as string | undefined;
  if (pat) return { scheme: "Bearer", token: pat };

  return null;
}

export async function supabaseAuthorizedFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const auth = await getSupabaseToken();
  if (!auth) {
    return new Response(JSON.stringify({ error: "Supabase not connected" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }) as unknown as Response;
  }
  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `${auth.scheme} ${auth.token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  return fetch(url, { ...init, headers });
}
