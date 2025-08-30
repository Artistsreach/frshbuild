"use server";

import { cookies } from "next/headers";

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    
    if (!sessionCookie) {
      return null;
    }

    // Try to import Firebase Admin dynamically
    let auth;
    try {
      const { auth: firebaseAuth } = await import("@/lib/firebase-admin");
      auth = firebaseAuth;
    } catch (error) {
      console.error("Firebase Admin not available for getUser:", error);
      return null;
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    return {
      id: decodedClaims.uid,
      displayName: decodedClaims.name || decodedClaims.email?.split('@')[0] || "User",
      primaryEmail: decodedClaims.email,
      profileImageUrl: decodedClaims.picture,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
