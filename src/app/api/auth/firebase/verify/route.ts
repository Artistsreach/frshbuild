import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { stackServerApp } from "@/auth/stack-auth";
import { initializeFirestoreUser } from "@/lib/firestore";

// Initialize Firebase Admin if not already initialized
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing");
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required");
    }

    try {
      const serviceAccountJson = JSON.parse(serviceAccount);
      console.log("Firebase Admin: Initializing with project ID:", serviceAccountJson.project_id);

      initializeApp({
        credential: cert(serviceAccountJson),
        projectId: "fresh25",
      });

      console.log("Firebase Admin: Successfully initialized");
    } catch (error) {
      console.error("Firebase Admin: Error parsing service account:", error);
      throw new Error("Invalid Firebase service account configuration");
    }
  }
  return getAuth();
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      console.error("Firebase verify: No ID token provided");
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    console.log("Firebase verify: Attempting to verify token");

    const auth = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);

    console.log("Firebase verify: Token verified successfully for user:", decodedToken.email);

    const user = await stackServerApp.getUser();
    if (!user) {
      console.error("Firebase verify: No Stack Auth session found");
      return NextResponse.json({ error: "No Stack Auth session found" }, { status: 401 });
    }

    console.log("Firebase verify: Stack Auth user found:", user.id);

    try {
      await initializeFirestoreUser(
        decodedToken.uid,
        decodedToken.email || '',
        decodedToken.name,
        decodedToken.picture
      );
      console.log("Firebase verify: User initialized in Firestore");
    } catch (firestoreError) {
      console.error("Firebase verify: Error initializing user in Firestore:", firestoreError);
      // Continue with the process even if Firestore fails
    }

    const currentMetadata = user.serverMetadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      firebaseUid: decodedToken.uid,
      firebaseEmail: decodedToken.email,
      firebaseEmailVerified: decodedToken.email_verified,
      firebaseDisplayName: decodedToken.name,
      firebasePicture: decodedToken.picture,
      firebaseAuthTime: new Date().toISOString(),
    };
    await user.update({ serverMetadata: updatedMetadata });

    console.log("Firebase verify: User metadata updated successfully");

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        picture: decodedToken.picture
      }
    });
  } catch (error: any) {
    console.error("Firebase verify: Token verification error:", error);

    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error.code === 'auth/argument-error') {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    }

    return NextResponse.json({
      error: "Token verification failed",
      details: error.message
    }, { status: 500 });
  }
}
