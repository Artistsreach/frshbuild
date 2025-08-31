"use server";

// Simple chat state management without Redis dependency
const chatStates = new Map<string, { state: string; messages: any[] }>();

export async function chatState(appId: string) {
  // Return a default state if no Redis is available
  const defaultState = chatStates.get(appId) || { 
    state: "stopped", 
    messages: [] 
  };
  
  return defaultState;
}

export async function updateChatState(appId: string, state: string, messages?: any[]) {
  const current = chatStates.get(appId) || { state: "stopped", messages: [] };
  chatStates.set(appId, {
    state,
    messages: messages || current.messages
  });
  return { success: true };
}
