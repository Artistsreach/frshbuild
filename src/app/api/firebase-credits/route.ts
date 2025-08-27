import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/auth/stack-auth";

// Server-side Firebase admin for secure access
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function getFirebaseAdminApp(): App | undefined {
  // Use Firebase Admin SDK for server-side access
  const projectId = process.env.FIREBASE_OTHER_PROJECT_ID;
  const privateKey = process.env.FIREBASE_OTHER_PROJECT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_OTHER_PROJECT_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn("Firebase Admin SDK configuration missing");
    return undefined;
  }

  if (!adminApp) {
    const existingApp = getApps().find(app => app.options?.projectId === projectId);
    
    if (existingApp) {
      adminApp = existingApp;
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        projectId,
      }, "admin-other-project");
    }
  }
  
  return adminApp;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current Stack Auth user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Check if the user has a Google OAuth provider linked
    const oAuthAccounts = user.oAuthAccounts || [];
    const googleAccount = oAuthAccounts.find(account => account.providerId === "google");
    
    if (!googleAccount) {
      return NextResponse.json({ error: "No Google account linked" }, { status: 400 });
    }

    // Get Google user info from the OAuth account
    // Stack Auth stores the Google user ID which we can use to find the user in Firestore
    const googleUserId = googleAccount.accountId;
    const userEmail = googleAccount.email;

    if (!googleUserId && !userEmail) {
      return NextResponse.json({ error: "No Google user identifier found" }, { status: 400 });
    }

    // Initialize Firebase Admin
    const adminApp = getFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const firestore = getFirestore(adminApp);

    // Try to find user by Google UID first, then by email
    let userDoc;
    let credits = 0;

    if (googleUserId) {
      // Option 1: Look for user document with Google UID
      // This assumes your Firestore has users stored with Google UID as document ID
      try {
        userDoc = await firestore.collection("users").doc(googleUserId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          credits = userData?.credits || 0;
        }
      } catch (error) {
        console.log("Could not find user by Google UID:", googleUserId);
      }
    }

    // Option 2: If not found by UID, try to find by email
    if (!userDoc?.exists && userEmail) {
      try {
        const querySnapshot = await firestore
          .collection("users")
          .where("email", "==", userEmail)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          credits = userData?.credits || 0;
        }
      } catch (error) {
        console.log("Could not find user by email:", userEmail);
      }
    }

    return NextResponse.json({
      credits,
      googleUserId,
      userEmail,
      found: credits > 0 || (userDoc?.exists),
    });

  } catch (error) {
    console.error("Error fetching Firebase credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to update credits (if needed)
export async function POST(request: NextRequest) {
  try {
    const { credits } = await request.json();
    
    if (typeof credits !== "number" || credits < 0) {
      return NextResponse.json({ error: "Invalid credits value" }, { status: 400 });
    }

    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const oAuthAccounts = user.oAuthAccounts || [];
    const googleAccount = oAuthAccounts.find(account => account.providerId === "google");
    
    if (!googleAccount) {
      return NextResponse.json({ error: "No Google account linked" }, { status: 400 });
    }

    const googleUserId = googleAccount.accountId;
    if (!googleUserId) {
      return NextResponse.json({ error: "No Google user ID found" }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const firestore = getFirestore(adminApp);
    
    // Update credits in Firestore
    await firestore.collection("users").doc(googleUserId).update({
      credits,
      lastUpdated: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      credits,
      message: "Credits updated successfully" 
    });

  } catch (error) {
    console.error("Error updating Firebase credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
