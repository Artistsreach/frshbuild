import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import { useState, useEffect } from "react";

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase app not initialized");
  }
  return getAuth(app);
}

export function getGoogleProvider() {
  return new GoogleAuthProvider();
}

export async function signInWithGoogle() {
  try {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

export function getCurrentUser(): User | null {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getIdToken(user: User): Promise<string> {
  try {
    return await user.getIdToken();
  } catch (error: any) {
    console.error("Error getting ID token:", error);
    throw error;
  }
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
