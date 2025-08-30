// Client-side Firebase initialization for Storage uploads
// Ensure the following env vars are set in .env.local or environment:
// NEXT_PUBLIC_FIREBASE_API_KEY
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// NEXT_PUBLIC_FIREBASE_PROJECT_ID
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (optional)
// NEXT_PUBLIC_FIREBASE_APP_ID
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAZLKhYHLevVvBVfWG9ZLwVZMlQ9Fh8zA",
  authDomain: "fresh25.firebaseapp.com",
  projectId: "fresh25",
  storageBucket: "fresh25.firebasestorage.app",
  messagingSenderId: "382962850342",
  appId: "1:382962850342:web:4a87b6ee30d0c77bf2a4e7",
  measurementId: "G-CZZW8LMXN3"
};

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === "undefined") return undefined;
  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp(firebaseConfig);
    
    // Initialize Analytics only in browser
    if (typeof window !== "undefined") {
      try {
        getAnalytics(app);
      } catch (error) {
        console.log("Analytics not available:", error);
      }
    }
  }
  return app;
}

export { firebaseConfig };
