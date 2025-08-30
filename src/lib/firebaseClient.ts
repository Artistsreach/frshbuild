import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBAZLKhYHLevVvBVfWG9ZLwVZMlQ9Fh8zA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fresh25.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fresh25",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fresh25.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "382962850342",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:382962850342:web:4a87b6ee30d0c77bf2a4e7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-CZZW8LMXN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Export the app instance for other uses
export { app };

// Utility function to check if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development';

// Connect to emulators in development
if (isDevelopment && typeof window !== 'undefined') {
  // Only connect to emulators in browser environment
  try {
    // Uncomment these lines if you want to use Firebase emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Firebase emulators available but not connected. Uncomment lines above to use.');
  } catch (error) {
    console.log('Firebase emulators not available:', error);
  }
}
