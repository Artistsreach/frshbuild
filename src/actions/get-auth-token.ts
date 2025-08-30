"use server";

import { cookies } from "next/headers";
import { auth } from "firebase-admin";

export async function getAuthToken() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    // Try to import Firebase Admin dynamically
    let firebaseAuth;
    try {
      const { auth: adminAuth } = await import("@/lib/firebase-admin");
      firebaseAuth = adminAuth;
    } catch (error) {
      console.error("Firebase Admin not available for getAuthToken:", error);
      return null;
    }

    if (!firebaseAuth) {
      console.error("Firebase Admin not available for getAuthToken");
      return null;
    }

    const decodedClaims = await firebaseAuth.verifySessionCookie(sessionCookie, true);
    const token = await firebaseAuth.createCustomToken(decodedClaims.uid);

    return {
      token,
      uid: decodedClaims.uid,
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}
