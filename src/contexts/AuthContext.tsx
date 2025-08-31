"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseClient';
import { initializeCredits } from '../lib/credits';

interface UserProfile {
  uid: string;
  email: string;
  role: string;
  createdAt: Date;
  displayName?: string;
  photoURL?: string;
  freestyleIdentity?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by only running auth logic after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let profileUnsubscribe = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      profileUnsubscribe();

      if (currentUser) {
        console.log('User authenticated:', currentUser.uid);

        // Initialize credits for new users
        try {
          await initializeCredits(currentUser.uid);
        } catch (error) {
          console.error('Error initializing credits:', error);
        }

        // Listen to profile changes
        const profileRef = doc(db, 'profiles', currentUser.uid);
        profileUnsubscribe = onSnapshot(profileRef, async (profileSnap) => {
          if (profileSnap.exists()) {
            const profileData = { uid: currentUser.uid, ...profileSnap.data() } as UserProfile;
            console.log('Profile loaded:', profileData);
            setProfile(profileData);
          } else {
            // Create profile if it doesn't exist
            try {
              console.log('Creating new profile for user:', currentUser.uid);
              const newProfile = {
                email: currentUser.email || '',
                role: 'user',
                createdAt: new Date(),
                displayName: currentUser.displayName || undefined,
                photoURL: currentUser.photoURL || undefined,
                // Note: freestyleIdentity will be set later when user creates their first app
              };
              
              await setDoc(profileRef, newProfile);
              setProfile({ 
                uid: currentUser.uid, 
                ...newProfile
              });
              console.log('Profile created successfully');
            } catch (error) {
              console.error('Error creating profile:', error);
              setProfile(null);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error('Error listening to profile:', error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        console.log('User signed out');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      profileUnsubscribe();
    };
  }, [mounted]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading: !mounted || loading,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
