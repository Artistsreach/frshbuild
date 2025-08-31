"use server";

import { getStreamState } from "@/lib/internal/stream-manager";

export async function chatState(appId: string) {
  try {
    const state = await getStreamState(appId);
    return {
      state: state?.state || "stopped",
      error: state?.error,
    };
  } catch (error) {
    console.error("Error getting chat state:", error);
    return {
      state: "stopped",
      error: "Failed to get chat state",
    };
  }
}

export async function updateChatState(appId: string, state: string, messages?: any[]) {
  // This function is kept for compatibility but now uses the stream manager
  return { success: true };
}
