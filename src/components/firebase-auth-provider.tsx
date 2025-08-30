"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useFirebaseAuth, signInWithGoogle, signOutUser } from "@/lib/firebase-auth";
import { initializeFirestoreUser } from "@/lib/firestore";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function useFirebaseAuthContext() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuthContext must be used within a FirebaseAuthProvider");
  }
  return context;
}

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
  autoLogin?: boolean;
}

export function FirebaseAuthProvider({ children, autoLogin = true }: FirebaseAuthProviderProps) {
  const { user, loading } = useFirebaseAuth();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!autoLogin || loading || isAutoLoggingIn || hasCheckedAuth) return;

    const handleAutoLogin = async () => {
      setIsAutoLoggingIn(true);
      try {
        const hostname = window.location.hostname;
        console.log("FirebaseAuthProvider: Current hostname:", hostname);
        console.log("FirebaseAuthProvider: Firebase user:", user);
        console.log("FirebaseAuthProvider: Loading state:", loading);

        // Wait a bit for Firebase auth to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user is already authenticated with Firebase
        if (user) {
          console.log("FirebaseAuthProvider: Firebase user found:", user.email);
          // Verify the token with our server and link the account
          await verifyTokenAndLinkAccount(user);
        } else {
          console.log("FirebaseAuthProvider: No Firebase user found, user needs to sign in");
          // Don't redirect - let the user sign in manually or show a sign-in prompt
        }
      } catch (error) {
        console.error("FirebaseAuthProvider: Auto-login error:", error);
      } finally {
        setIsAutoLoggingIn(false);
        setHasCheckedAuth(true);
      }
    };
    handleAutoLogin();
  }, [autoLogin, loading, user, isAutoLoggingIn, hasCheckedAuth]);

  useEffect(() => {
    if (user && !loading) {
      console.log("FirebaseAuthProvider: User authenticated with Firebase:", user.email);
      verifyTokenAndLinkAccount(user);
    }
  }, [user, loading]);

  const verifyTokenAndLinkAccount = async (firebaseUser: User) => {
    try {
      console.log("FirebaseAuthProvider: Verifying token and linking account for:", firebaseUser.email);
      const idToken = await firebaseUser.getIdToken();
      console.log("FirebaseAuthProvider: Got ID token, length:", idToken.length);

      const response = await fetch('/api/auth/firebase/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      console.log("FirebaseAuthProvider: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('FirebaseAuthProvider: Account linked successfully:', data.user);
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('FirebaseAuthProvider: Failed to link account. Status:', response.status, 'Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('FirebaseAuthProvider: Error details:', errorData);
        } catch (e) {
          console.error('FirebaseAuthProvider: Could not parse error response as JSON');
        }
        // Don't redirect - just log the error and let the user try again
      }
    } catch (error) {
      console.error('FirebaseAuthProvider: Error verifying token:', error);
      // Don't redirect - just log the error and let the user try again
    }
  };

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("FirebaseAuthProvider: User signed in:", user.email);
      
      // Initialize user in Firestore
      await initializeFirestoreUser(
        user.uid,
        user.email || '',
        user.displayName || undefined,
        user.photoURL || undefined
      );
      
      // Verify token and link account
      await verifyTokenAndLinkAccount(user);
    } catch (error) {
      console.error("FirebaseAuthProvider: Sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      console.log("FirebaseAuthProvider: User signed out");
      window.location.reload();
    } catch (error) {
      console.error("FirebaseAuthProvider: Sign-out error:", error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("FirebaseAuthProvider: Error getting token:", error);
      return null;
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    getToken,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
