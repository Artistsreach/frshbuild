import "server-only";
import { NextResponse } from "next/server";

// OAuth authorize endpoint: redirects the user to Supabase's consent screen.
// Requires env vars:
// - SUPABASE_OAUTH_CLIENT_ID
// - SUPABASE_OAUTH_REDIRECT_URI (e.g. https://your.app/api/supabase/oauth/callback)
// - SUPABASE_OAUTH_SCOPES (optional, default: 'all')

export async function GET() {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.SUPABASE_OAUTH_REDIRECT_URI;
  const scope = process.env.SUPABASE_OAUTH_SCOPES || "all";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing SUPABASE_OAUTH_CLIENT_ID or SUPABASE_OAUTH_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const authorizeUrl = new URL("https://api.supabase.com/v1/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authorizeUrl.toString());
  res.cookies.set("sb_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  return res;
}
