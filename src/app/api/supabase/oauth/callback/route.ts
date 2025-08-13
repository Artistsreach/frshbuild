import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stackServerApp } from "@/auth/stack-auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const stateCookie = cookieStore.get("sb_oauth_state")?.value;
    if (!stateCookie || stateCookie !== state) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.SUPABASE_OAUTH_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: "Missing SUPABASE_OAUTH_* env vars" },
        { status: 500 }
      );
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json(
        { error: `Token exchange failed: ${text}` },
        { status: 400 }
      );
    }

    const tokenJson = await tokenRes.json();
    const { access_token, refresh_token, expires_in, token_type } = tokenJson as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    };

    if (!access_token) {
      return NextResponse.json({ error: "No access token in response" }, { status: 400 });
    }

    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const current = user.serverMetadata || {};
    await user.update({
      serverMetadata: {
        ...current,
        supabaseOAuth: {
          access_token,
          refresh_token,
          token_type,
          expires_in,
          updated_at: new Date().toISOString(),
        },
      },
    });

    // Clear state cookie and redirect back
    const res = NextResponse.redirect("/");
    res.cookies.set("sb_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
