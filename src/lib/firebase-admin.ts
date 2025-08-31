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
      let serviceAccountJson;
      
      // Try to parse as JSON first
      try {
        serviceAccountJson = JSON.parse(serviceAccount);
      } catch (parseError) {
        // If JSON parsing fails, try base64 decoding first
        try {
          const decoded = Buffer.from(serviceAccount, 'base64').toString('utf-8');
          serviceAccountJson = JSON.parse(decoded);
        } catch (base64Error) {
          // If both fail, try to clean up the string (remove escape characters)
          const cleaned = serviceAccount
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
          try {
            serviceAccountJson = JSON.parse(cleaned);
          } catch (cleanError) {
            // Last attempt: try to fix common formatting issues
            const fixed = serviceAccount
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
              .replace(/\n\s*/g, '\n') // Remove extra spaces after newlines
              .replace(/"\s*\n\s*"/g, '"\n"'); // Fix spacing around newlines in strings
            try {
              serviceAccountJson = JSON.parse(fixed);
            } catch (finalError) {
              console.error("Firebase Admin: Failed to parse service account key in all formats:", {
                parseError,
                base64Error,
                cleanError,
                finalError
              });
              throw new Error("Invalid Firebase service account key format");
            }
          }
        }
      }

      // Validate the service account JSON
      if (!serviceAccountJson.project_id || !serviceAccountJson.private_key) {
        throw new Error("Invalid Firebase service account: missing project_id or private_key");
      }

      // Fix common private key formatting issues
      if (serviceAccountJson.private_key) {
        // Ensure the private key has proper PEM format
        let privateKey = serviceAccountJson.private_key;
        
        // Remove any extra whitespace or formatting
        privateKey = privateKey.trim();
        
        // Ensure it starts with the correct header
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          // Try to fix common issues
          if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            // Extract the key between the markers
            const startMarker = '-----BEGIN PRIVATE KEY-----';
            const endMarker = '-----END PRIVATE KEY-----';
            const startIndex = privateKey.indexOf(startMarker);
            const endIndex = privateKey.indexOf(endMarker);
            
            if (startIndex !== -1 && endIndex !== -1) {
              privateKey = privateKey.substring(startIndex, endIndex + endMarker.length);
            }
          } else {
            // If no markers found, try to wrap it
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
          }
        }
        
        // Ensure proper line breaks
        privateKey = privateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        serviceAccountJson.private_key = privateKey;
      }

      console.log("Firebase Admin: Initializing with project ID:", serviceAccountJson.project_id);

      initializeApp({
        credential: cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id || "fresh25",
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
