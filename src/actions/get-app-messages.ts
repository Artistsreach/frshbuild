"use server";

import { memory } from "@/mastra/agents/builder";
import { UIMessage } from "ai";

export async function getAppMessages(appId: string): Promise<UIMessage[]> {
  try {
    // Try to get messages from Mastra memory
    const result = await memory.query({
      threadId: appId,
      resourceId: appId,
    });
    
    if (result.uiMessages && result.uiMessages.length > 0) {
      return result.uiMessages;
    }
    
    // If no messages found, return empty array
    return [];
  } catch (error) {
    console.error("Error querying Mastra memory:", error);
    
    // Return empty array on error instead of failing completely
    return [];
  }
}
