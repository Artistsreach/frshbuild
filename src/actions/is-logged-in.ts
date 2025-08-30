"use server";

import { cookies } from "next/headers";

export async function isLoggedIn(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return false;
    }

    // Try to import Firebase Admin dynamically and verify the session cookie
    try {
      const { auth } = await import("@/lib/firebase-admin");
      if (!auth) {
        console.error("Firebase Admin not available for isLoggedIn");
        return false;
      }
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      return !!decodedClaims;
    } catch (error) {
      console.error(
        "Firebase Admin not available or session cookie invalid:",
        error
      );
      return false;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}
