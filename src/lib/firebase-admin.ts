import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin if not already initialized
export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing");
      // For development/testing, we can continue without Firebase Admin
      if (process.env.NODE_ENV === "development") {
        console.warn("Running in development mode without Firebase Admin");
        return null;
      }
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required");
    }

    try {
      const serviceAccountJson =
        serviceAccount.trim().startsWith('{')
          ? JSON.parse(serviceAccount)
          : JSON.parse(Buffer.from(serviceAccount, 'base64').toString('utf-8'));

      // Replace \\n with \n in the private_key
      if (serviceAccountJson.private_key) {
        serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
      }

      console.log("Firebase Admin: Initializing with project ID:", serviceAccountJson.project_id);

      initializeApp({
        credential: cert(serviceAccountJson),
        projectId: "fresh25",
      });

      console.log("Firebase Admin: Successfully initialized");
    } catch (error) {
      console.error("Firebase Admin: Error parsing service account:", error);
      if (process.env.NODE_ENV === "development") {
        console.warn("Running in development mode without Firebase Admin");
        return null;
      }
      throw new Error("Invalid Firebase service account configuration");
    }
  }
  
  try {
    return getAuth();
  } catch (error) {
    console.error("Firebase Admin: Error getting auth:", error);
    return null;
  }
}

export const auth = getFirebaseAdmin;
