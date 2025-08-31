import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", "", { expires: new Date(0) });
    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
