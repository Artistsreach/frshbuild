import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (e) {
  console.log('Re-initializing admin not required');
}

const db = admin.firestore();

// ===== CREDIT SYSTEM FUNCTIONS =====

// Initialize user credits and profile on signup
export const initializeUser = functions.auth.user().onCreate(async (user) => {
  console.log('New user detected, initializing credits and profile:', user.uid);

  try {
    // Initialize credits
    const userCreditsRef = db.collection('users').doc(user.uid);
    const userCreditsSnap = await userCreditsRef.get();

    if (!userCreditsSnap.exists) {
      await userCreditsRef.set({ 
        credits: 100,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`100 credits initialized for user: ${user.uid}`);
    }

    // Initialize profile
    const profileRef = db.collection('profiles').doc(user.uid);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      await profileRef.set({
        email: user.email,
        role: 'store_owner',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      });
      console.log(`Profile created for user: ${user.uid}`);
    }
  } catch (error) {
    console.error('Error initializing user:', error);
  }
});

// Chat function with credit deduction
export const chatWithCredits = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messages } = data;
  const userId = context.auth.uid;
  const creditCost = 10; // Cost per chat message - updated from 5 to 10

  try {
    // Check if user has enough credits
    const userCreditsRef = db.collection('users').doc(userId);
    const userCreditsSnap = await userCreditsRef.get();

    if (!userCreditsSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User credits not initialized');
    }

    const currentCredits = userCreditsSnap.data()?.credits || 0;
    
    if (currentCredits < creditCost) {
      throw new functions.https.HttpsError('resource-exhausted', 'Insufficient credits', {
        currentCredits,
        requiredCredits: creditCost
      });
    }

    // Deduct credits before processing
    await userCreditsRef.update({
      credits: admin.firestore.FieldValue.increment(-creditCost),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Deducted ${creditCost} credits from user ${userId}. Remaining: ${currentCredits - creditCost}`);

    // Here you would integrate with your AI service
    // For now, we'll return a mock response
    const response = await processChatMessage(messages);

    return {
      success: true,
      response,
      creditsDeducted: creditCost,
      remainingCredits: currentCredits - creditCost
    };

  } catch (error) {
    console.error('Chat function error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to process chat message');
  }
});

// Get user credits
export const getUserCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userCreditsRef = db.collection('users').doc(userId);
    const userCreditsSnap = await userCreditsRef.get();

    if (!userCreditsSnap.exists) {
      // Initialize credits if they don't exist
      await userCreditsRef.set({ 
        credits: 100,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { credits: 100 };
    }

    return { credits: userCreditsSnap.data()?.credits || 0 };
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user credits');
  }
});

// Add credits to user account
export const addCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount } = data;
  const userId = context.auth.uid;

  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid credit amount');
  }

  try {
    const userCreditsRef = db.collection('users').doc(userId);
    await userCreditsRef.update({
      credits: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`${amount} credits added to user ${userId}`);
    
    return { success: true, creditsAdded: amount };
  } catch (error) {
    console.error('Error adding credits:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add credits');
  }
});

// Add credits on successful payment
export const addCreditsOnPayment = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, paymentId } = data;
  const userId = context.auth.uid;

  try {
    // Verify payment (implement your payment verification logic)
    const paymentVerified = await verifyPayment(paymentId);
    
    if (!paymentVerified) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment verification failed');
    }

    // Add credits
    const userCreditsRef = db.collection('users').doc(userId);
    await userCreditsRef.update({
      credits: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`${amount} credits added to user ${userId} for payment ${paymentId}`);
    
    return { success: true, creditsAdded: amount };
  } catch (error) {
    console.error('Error adding credits:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add credits');
  }
});

// ===== HELPER FUNCTIONS =====

// Helper function to process chat messages (replace with your AI integration)
async function processChatMessage(messages: any[]): Promise<string> {
  // This is where you would integrate with OpenAI, Anthropic, or other AI services
  // For now, returning a mock response
  
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content || '';
  
  // Mock AI response
  return `I received your message: "${userMessage}". This is a mock response from the Firebase Function. In production, you would integrate with an AI service here.`;
}

// Helper function to verify payment (implement based on your payment provider)
async function verifyPayment(paymentId: string): Promise<boolean> {
  // Implement payment verification logic
  // This could involve checking with Stripe, PayPal, etc.
  return true; // Placeholder
}
