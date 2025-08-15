import "server-only";
import { NextResponse } from "next/server";
import { supabaseAuthorizedFetch } from "@/lib/supabase-auth";

export async function GET() {
  try {
    const res = await supabaseAuthorizedFetch("https://api.supabase.com/v1/projects", {
      method: "GET",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || `Upstream ${res.status}` }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
