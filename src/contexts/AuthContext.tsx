"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { freestyle } from "@/lib/freestyle";

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
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      let profileUnsubscribe: (() => void) | undefined;

      if (currentUser) {
        console.log('User authenticated:', currentUser.uid);

        // Initialize credits for new users
        try {
          const { initializeCredits } = await import("@/lib/credits");
          await initializeCredits(currentUser.uid);
        } catch (error) {
          console.error("Error initializing credits:", error);
        }

        // Listen to profile changes
        const profileRef = doc(db, 'profiles', currentUser.uid);
        profileUnsubscribe = onSnapshot(profileRef, async (profileSnap) => {
          if (profileSnap.exists()) {
            const profileData = { uid: currentUser.uid, ...profileSnap.data() } as UserProfile;
            console.log('Profile loaded:', profileData);
            
            // Check if user needs freestyleIdentity
            if (!profileData.freestyleIdentity) {
              console.log('Creating freestyleIdentity for user:', currentUser.uid);
              try {
                const identity = await freestyle.createGitIdentity();
                console.log('FreestyleIdentity created:', identity.id);
                
                // Try to update profile with freestyleIdentity
                try {
                  await setDoc(profileRef, { 
                    freestyleIdentity: identity.id 
                  }, { merge: true });
                  console.log('Profile updated with freestyleIdentity');
                } catch (firestoreError) {
                  console.error('Error updating profile with freestyleIdentity:', firestoreError);
                  // Even if Firestore update fails, we can still use the identity
                  // Update the local profile data
                  profileData.freestyleIdentity = identity.id;
                  console.log('Using freestyleIdentity locally:', identity.id);
                }
              } catch (error) {
                console.error('Error creating freestyleIdentity:', error);
                // Continue without freestyleIdentity for now
              }
            }
            
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
                // freestyleIdentity will be created in the onSnapshot listener above
              };
              
              await setDoc(profileRef, newProfile);
              console.log('Profile created successfully');
              
              // The profile will be updated via the onSnapshot listener
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

      return () => {
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }
      };
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const context: AuthContextType = {
    user,
    profile,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={context}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
