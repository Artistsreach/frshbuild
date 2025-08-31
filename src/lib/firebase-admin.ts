import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let firebaseAdminInitialized = false;

// Initialize Firebase Admin if not already initialized
export function getFirebaseAdmin() {
  if (getApps().length === 0 && !firebaseAdminInitialized) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing");
      firebaseAdminInitialized = true;
      return null;
    }

    try {
      let serviceAccountJson;
      
      // Try to parse as JSON first
      try {
        serviceAccountJson = JSON.parse(serviceAccount);
      } catch (parseError) {
        // If JSON parsing fails, try base64 decoding
        try {
          const decoded = Buffer.from(serviceAccount, 'base64').toString('utf-8');
          serviceAccountJson = JSON.parse(decoded);
        } catch (base64Error) {
          // If both fail, try to clean up the string
          const cleaned = serviceAccount
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          try {
            serviceAccountJson = JSON.parse(cleaned);
          } catch (cleanError) {
            console.error("Firebase Admin: Failed to parse service account key:", {
              parseError: parseError.message,
              base64Error: base64Error.message,
              cleanError: cleanError.message
            });
            firebaseAdminInitialized = true;
            return null;
          }
        }
      }

      // Validate required fields
      if (!serviceAccountJson.project_id || !serviceAccountJson.private_key) {
        console.error("Firebase Admin: Invalid service account - missing project_id or private_key");
        firebaseAdminInitialized = true;
        return null;
      }

      // Fix private key formatting
      if (serviceAccountJson.private_key) {
        let privateKey = serviceAccountJson.private_key.trim();
        
        // Ensure proper PEM format
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            const startIndex = privateKey.indexOf('-----BEGIN PRIVATE KEY-----');
            const endIndex = privateKey.indexOf('-----END PRIVATE KEY-----');
            if (startIndex !== -1 && endIndex !== -1) {
              privateKey = privateKey.substring(startIndex, endIndex + '-----END PRIVATE KEY-----'.length);
            }
          } else {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
          }
        }
        
        // Normalize line breaks
        privateKey = privateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        serviceAccountJson.private_key = privateKey;
      }

      console.log("Firebase Admin: Initializing with project ID:", serviceAccountJson.project_id);

      try {
        initializeApp({
          credential: cert(serviceAccountJson),
          projectId: serviceAccountJson.project_id,
        });
        console.log("Firebase Admin: Successfully initialized");
        firebaseAdminInitialized = true;
      } catch (initError) {
        console.error("Firebase Admin: Error during initialization:", initError);
        firebaseAdminInitialized = true;
        return null;
      }
    } catch (error) {
      console.error("Firebase Admin: Error parsing service account:", error);
      firebaseAdminInitialized = true;
      return null;
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
