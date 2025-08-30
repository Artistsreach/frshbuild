import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, onSnapshot, collection } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";

export interface FirestoreUser {
  uid: string;
  credits: number;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  createdAt: Date;
  displayName?: string;
  photoURL?: string;
}

let db: any = null;

function getFirestoreInstance() {
  if (!db) {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase app not initialized");
    }
    db = getFirestore(app);
  }
  return db;
}

const getUserCreditsRef = (userId: string) => doc(getFirestoreInstance(), 'users', userId);
const getUserProfileRef = (userId: string) => doc(getFirestoreInstance(), 'profiles', userId);

/**
 * Initialize credits for a new user
 * @param userId - Firebase user UID
 */
export const initializeCredits = async (userId: string): Promise<void> => {
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    const userCreditsSnap = await getDoc(userCreditsRef);

    if (!userCreditsSnap.exists()) {
      await setDoc(userCreditsRef, { 
        credits: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`100 credits initialized for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error initializing credits:", error);
    throw error;
  }
};

/**
 * Get current credit balance for a user
 * @param userId - Firebase user UID
 * @returns Current credit balance
 */
export const getCredits = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    const userCreditsSnap = await getDoc(userCreditsRef);

    if (userCreditsSnap.exists()) {
      return userCreditsSnap.data().credits || 0;
    } else {
      await initializeCredits(userId);
      return 100;
    }
  } catch (error) {
    console.error("Error getting credits:", error);
    return 0;
  }
};

/**
 * Check if user has enough credits for an operation
 * @param userId - Firebase user UID
 * @param amount - Credits required
 * @returns True if user has enough credits
 */
export const canDeductCredits = async (userId: string, amount: number): Promise<boolean> => {
  const currentCredits = await getCredits(userId);
  return currentCredits >= amount;
};

/**
 * Deduct credits from user account
 * @param userId - Firebase user UID
 * @param amount - Credits to deduct
 * @throws Error if insufficient credits or user not authenticated
 */
export const deductCredits = async (userId: string, amount: number): Promise<void> => {
  if (!userId) throw new Error('User not authenticated');
  
  const hasEnoughCredits = await canDeductCredits(userId, amount);
  if (!hasEnoughCredits) {
    throw new Error('Insufficient credits');
  }

  try {
    const userCreditsRef = getUserCreditsRef(userId);
    await updateDoc(userCreditsRef, {
      credits: increment(-amount),
      updatedAt: new Date()
    });
    console.log(`Successfully deducted ${amount} credits from user ${userId}`);
  } catch (error) {
    console.error("Error deducting credits:", error);
    throw error;
  }
};

/**
 * Add credits to user account
 * @param userId - Firebase user UID
 * @param amount - Credits to add
 */
export const addCredits = async (userId: string, amount: number): Promise<void> => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    await updateDoc(userCreditsRef, {
      credits: increment(amount),
      updatedAt: new Date()
    });
    console.log(`Successfully added ${amount} credits to user ${userId}`);
  } catch (error) {
    console.error("Error adding credits:", error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param userId - Firebase user UID
 * @returns User profile data
 */
export const getFirestoreUser = async (userId: string): Promise<FirestoreUser | null> => {
  if (!userId) return null;
  
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    const userCreditsSnap = await getDoc(userCreditsRef);

    if (userCreditsSnap.exists()) {
      return { uid: userId, ...userCreditsSnap.data() } as FirestoreUser;
    }
    return null;
  } catch (error) {
    console.error("Error getting Firestore user:", error);
    return null;
  }
};

/**
 * Set user data in Firestore
 * @param userId - Firebase user UID
 * @param userData - User data to set
 */
export const setFirestoreUser = async (userId: string, userData: Partial<FirestoreUser>): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    await setDoc(userCreditsRef, {
      ...userData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error setting Firestore user:", error);
    throw error;
  }
};

/**
 * Update user credits in Firestore
 * @param userId - Firebase user UID
 * @param credits - New credit amount
 */
export const updateUserCredits = async (userId: string, credits: number): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    const userCreditsRef = getUserCreditsRef(userId);
    await updateDoc(userCreditsRef, {
      credits,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating user credits:", error);
    throw error;
  }
};

/**
 * Get user credits from Firestore (legacy function for compatibility)
 * @param userId - Firebase user UID
 * @returns User credits
 */
export const getUserCreditsFromFirestore = async (userId: string): Promise<number> => {
  return await getCredits(userId);
};

/**
 * Initialize user in Firestore with profile and credits
 * @param userId - Firebase user UID
 * @param email - User email
 * @param displayName - User display name
 * @param photoURL - User photo URL
 */
export const initializeFirestoreUser = async (
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string
): Promise<void> => {
  try {
    // Initialize credits
    await initializeCredits(userId);
    
    // Initialize profile
    const profileRef = getUserProfileRef(userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        email,
        role: 'user',
        createdAt: new Date(),
        displayName,
        photoURL
      });
      console.log(`Profile created for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error initializing Firestore user:", error);
    throw error;
  }
};

/**
 * Listen to real-time credit updates
 * @param userId - Firebase user UID
 * @param callback - Callback function to handle credit updates
 * @returns Unsubscribe function
 */
export const listenToCredits = (userId: string, callback: (credits: number) => void) => {
  if (!userId) return () => {};
  
  const userCreditsRef = getUserCreditsRef(userId);
  return onSnapshot(userCreditsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.credits || 0);
    } else {
      callback(0);
    }
  });
};
