import "server-only";
import { NextResponse } from "next/server";

export async function GET() {
  const vars = {
    SUPABASE_OAUTH_CLIENT_ID: !!process.env.SUPABASE_OAUTH_CLIENT_ID,
    SUPABASE_OAUTH_CLIENT_SECRET: !!process.env.SUPABASE_OAUTH_CLIENT_SECRET,
    SUPABASE_OAUTH_REDIRECT_URI: !!process.env.SUPABASE_OAUTH_REDIRECT_URI,
    SUPABASE_OAUTH_SCOPES: !!process.env.SUPABASE_OAUTH_SCOPES,
    SUPABASE_POST_CONNECT_REDIRECT_TEMPLATE: !!process.env.SUPABASE_POST_CONNECT_REDIRECT_TEMPLATE,
  };
  return NextResponse.json(vars);
}
