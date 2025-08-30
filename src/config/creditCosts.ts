export const CREDIT_COSTS = {
  // Image operations
  generateImage: 5,
  editImage: 2,
  analyzeImage: 5,
  
  // Video operations
  generateVideo: 15,
  createVideo: 15,
  
  // Email operations
  composeEmail: 5,
  searchEmail: 5,
  
  // Document operations
  createDocument: 5,
  editDocument: 2,
  
  // Research operations
  deepResearch: 15,
  research: 15,
  
  // Task automation
  automateTask: 5,
  
  // Lead generation
  generateLeads: 10,
  
  // Content creation
  createContent: 5,
  generateText: 2,
  
  // Chat operations
  chatMessage: 10, // Updated from 5 to 10
  
  // App building
  buildApp: 10,
  
  // Free operations
  toggleTheme: 0,
  viewProfile: 0,
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;

export const getCreditCost = (operation: CreditOperation): number => {
  return CREDIT_COSTS[operation] || 0;
};

export const checkCreditsForOperation = async (userId: string, operation: CreditOperation): Promise<boolean> => {
  const cost = getCreditCost(operation);
  if (cost === 0) return true;
  
  const { canDeductCredits } = await import('../lib/credits');
  return await canDeductCredits(userId, cost);
};
