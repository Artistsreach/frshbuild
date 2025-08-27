// Firebase Authentication and Firestore for linking with other project
// This is separate from the existing firebase.ts (which is for storage)
// 
// Required environment variables for your other project:
// NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_API_KEY
// NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_AUTH_DOMAIN  
// NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_PROJECT_ID
// NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_APP_ID

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  type Auth, 
  GoogleAuthProvider, 
  signInWithCredential,
  type AuthCredential,
  type User 
} from "firebase/auth";
import { 
  getFirestore, 
  type Firestore, 
  doc, 
  getDoc, 
  type DocumentSnapshot 
} from "firebase/firestore";

let otherProjectApp: FirebaseApp | undefined;
let otherProjectAuth: Auth | undefined;
let otherProjectFirestore: Firestore | undefined;

// Initialize Firebase app for your other project
export function getOtherProjectFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === "undefined") return undefined;
  
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_OTHER_PROJECT_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    console.warn("Firebase other project configuration missing");
    return undefined;
  }

  if (!otherProjectApp) {
    // Check if we already have an app with this project ID
    const existingApp = getApps().find(app => app.options.projectId === projectId);
    
    if (existingApp) {
      otherProjectApp = existingApp;
    } else {
      otherProjectApp = initializeApp({
        apiKey,
        authDomain,
        projectId,
        appId,
      }, "other-project"); // Give it a unique name
    }
  }
  
  return otherProjectApp;
}

// Get Firebase Auth for your other project
export function getOtherProjectAuth(): Auth | undefined {
  if (typeof window === "undefined") return undefined;
  
  if (!otherProjectAuth) {
    const app = getOtherProjectFirebaseApp();
    if (app) {
      otherProjectAuth = getAuth(app);
    }
  }
  
  return otherProjectAuth;
}

// Get Firestore for your other project
export function getOtherProjectFirestore(): Firestore | undefined {
  if (typeof window === "undefined") return undefined;
  
  if (!otherProjectFirestore) {
    const app = getOtherProjectFirebaseApp();
    if (app) {
      otherProjectFirestore = getFirestore(app);
    }
  }
  
  return otherProjectFirestore;
}

// Types for user credit data
export interface UserCredits {
  credits: number;
  userId: string;
  lastUpdated?: Date;
}

// Sign in to Firebase using Google OAuth token from Stack Auth
export async function signInToFirebaseWithGoogle(googleAccessToken: string): Promise<User | null> {
  try {
    const auth = getOtherProjectAuth();
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }

    // Create credential from Google access token
    const credential = GoogleAuthProvider.credential(null, googleAccessToken);
    
    // Sign in with the credential
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("Error signing in to Firebase with Google:", error);
    return null;
  }
}

// Fetch user credits from Firestore
export async function fetchUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const firestore = getOtherProjectFirestore();
    if (!firestore) {
      throw new Error("Firestore not initialized");
    }

    // Adjust the collection and document path based on your Firestore structure
    // This assumes users are stored in a "users" collection with credits field
    const userDocRef = doc(firestore, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log("No user document found for:", userId);
      return null;
    }

    const userData = userDocSnap.data();
    return {
      credits: userData.credits || 0,
      userId,
      lastUpdated: userData.lastUpdated?.toDate?.() || new Date(),
    };
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return null;
  }
}

// Combined function to authenticate and fetch credits
export async function authenticateAndFetchCredits(googleAccessToken: string): Promise<UserCredits | null> {
  try {
    // First, sign in to Firebase with Google token
    const user = await signInToFirebaseWithGoogle(googleAccessToken);
    
    if (!user) {
      console.error("Failed to authenticate with Firebase");
      return null;
    }

    // Then fetch the user's credits
    return await fetchUserCredits(user.uid);
  } catch (error) {
    console.error("Error in authenticateAndFetchCredits:", error);
    return null;
  }
}
