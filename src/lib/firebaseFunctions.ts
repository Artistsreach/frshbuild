import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from './firebaseClient';

// Define function types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
  creditsDeducted: number;
  remainingCredits: number;
}

interface CreditsResponse {
  credits: number;
}

interface AddCreditsResponse {
  success: boolean;
  creditsAdded: number;
}

// Create function callables
const chatWithCreditsFunction = httpsCallable<{ messages: ChatMessage[] }, ChatResponse>(
  functions,
  'chatWithCredits'
);

const getUserCreditsFunction = httpsCallable<{}, CreditsResponse>(
  functions,
  'getUserCredits'
);

const addCreditsFunction = httpsCallable<{ amount: number }, AddCreditsResponse>(
  functions,
  'addCredits'
);

const addCreditsOnPaymentFunction = httpsCallable<{ amount: number; paymentId: string }, AddCreditsResponse>(
  functions,
  'addCreditsOnPayment'
);

// Export functions
export const firebaseFunctions = {
  /**
   * Send a chat message and deduct credits
   */
  async chatWithCredits(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const result = await chatWithCreditsFunction({ messages });
      return result.data;
    } catch (error: any) {
      console.error('Chat function error:', error);
      
      // Handle specific Firebase Function errors
      if (error.code === 'functions/resource-exhausted') {
        throw new Error(`Insufficient credits. You need ${error.details?.requiredCredits || 10} credits.`);
      }
      
      if (error.code === 'functions/unauthenticated') {
        throw new Error('Please sign in to use this feature.');
      }
      
      throw new Error(error.message || 'Failed to send message');
    }
  },

  /**
   * Get current user credits
   */
  async getUserCredits(): Promise<number> {
    try {
      const result = await getUserCreditsFunction({});
      return result.data.credits;
    } catch (error: any) {
      console.error('Get credits error:', error);
      throw new Error('Failed to get credits');
    }
  },

  /**
   * Add credits to user account
   */
  async addCredits(amount: number): Promise<number> {
    try {
      const result = await addCreditsFunction({ amount });
      return result.data.creditsAdded;
    } catch (error: any) {
      console.error('Add credits error:', error);
      throw new Error('Failed to add credits');
    }
  },

  /**
   * Add credits on successful payment
   */
  async addCreditsOnPayment(amount: number, paymentId: string): Promise<number> {
    try {
      const result = await addCreditsOnPaymentFunction({ amount, paymentId });
      return result.data.creditsAdded;
    } catch (error: any) {
      console.error('Add credits on payment error:', error);
      throw new Error('Failed to add credits after payment');
    }
  }
};
