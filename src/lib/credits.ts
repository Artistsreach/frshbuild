import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseClient';

const getUserCreditsRef = (userId: string) => doc(db, 'users', userId);

/**
 * Initialize credits for a new user
 * @param userId - Firebase user UID
 */
export const initializeCredits = async (userId: string): Promise<void> => {
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
};

/**
 * Get current credit balance for a user
 * @param userId - Firebase user UID
 * @returns Current credit balance
 */
export const getCredits = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  const userCreditsRef = getUserCreditsRef(userId);
  const userCreditsSnap = await getDoc(userCreditsRef);

  if (userCreditsSnap.exists()) {
    return userCreditsSnap.data().credits || 0;
  } else {
    await initializeCredits(userId);
    return 100;
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

  const userCreditsRef = getUserCreditsRef(userId);
  await updateDoc(userCreditsRef, {
    credits: increment(-amount),
    updatedAt: new Date()
  });
  
  console.log(`Successfully deducted ${amount} credits from user ${userId}`);
};

/**
 * Add credits to user account
 * @param userId - Firebase user UID
 * @param amount - Credits to add
 */
export const addCredits = async (userId: string, amount: number): Promise<void> => {
  if (!userId) throw new Error('User not authenticated');
  
  const userCreditsRef = getUserCreditsRef(userId);
  await updateDoc(userCreditsRef, {
    credits: increment(amount),
    updatedAt: new Date()
  });
  
  console.log(`Successfully added ${amount} credits to user ${userId}`);
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
