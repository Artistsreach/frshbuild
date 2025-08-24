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
  let storageBucketEnv = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucketEnv || !appId) {
    return undefined;
  }

  // Determine how to pass storage configuration:
  // - If env starts with gs:// -> treat as explicit bucket URL; do NOT pass storageBucket into initializeApp.
  // - If env ends with firebasestorage.app -> convert to <name>.appspot.com.
  // - If env has no dot -> treat as raw bucket name (e.g., build25) and use getStorage(app, `gs://<name>`).
  let storageBucketOption: string | undefined = undefined; // for initializeApp
  let storageBucketUrl: string | undefined = undefined; // for getStorage(app, url)

  const raw = storageBucketEnv.trim();
  if (raw.startsWith("gs://")) {
    storageBucketUrl = raw;
  } else if (raw.endsWith("firebasestorage.app")) {
    // Convert domain-like bucket to appspot.com host
    const parts = raw.split(".");
    const name = parts[0];
    storageBucketOption = `${name}.appspot.com`;
  } else if (!raw.includes(".")) {
    // Looks like a bare bucket name (e.g., build25)
    storageBucketUrl = `gs://${raw}`;
  } else {
    // Assume it's a host-style bucket (e.g., build25.appspot.com)
    storageBucketOption = raw;
  }

  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp({
      apiKey,
      authDomain,
      projectId,
      // Only set storageBucket in options when we have a host-style name
      ...(storageBucketOption ? { storageBucket: storageBucketOption } : {}),
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
    // Recompute bucket preference here, mirroring logic above
    const envVal = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
    if (envVal && envVal.startsWith("gs://")) {
      storage = getFirebaseStorage(a, envVal);
    } else if (envVal && !envVal.includes(".")) {
      storage = getFirebaseStorage(a, `gs://${envVal}`);
    } else {
      storage = getFirebaseStorage(a);
    }
  }
  return storage;
}
