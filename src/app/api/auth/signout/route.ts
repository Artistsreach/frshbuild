import "server-only";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/auth/stack-auth";

export async function POST() {
  try {
    // Destroy the current session
    await stackServerApp.destroySession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
