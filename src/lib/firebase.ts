// Client-side Firebase initialization for Storage uploads
// Ensure the following env vars are set in .env.local or environment:
// NEXT_PUBLIC_FIREBASE_API_KEY
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// NEXT_PUBLIC_FIREBASE_PROJECT_ID
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (optional)
// NEXT_PUBLIC_FIREBASE_APP_ID
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getStorage as getFirebaseStorage, type FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | undefined;
let storage: FirebaseStorage | undefined;

export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === "undefined") return undefined;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !appId) {
    return undefined;
  }

  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      appId,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
  }
  return app;
}

export function getStorage(): FirebaseStorage | undefined {
  if (typeof window === "undefined") return undefined;
  if (!storage) {
    const a = getFirebaseApp();
    if (!a) return undefined;
    storage = getFirebaseStorage(a);
  }
  return storage;
}
