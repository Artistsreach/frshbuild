"use server";

import { builderAgent } from "@/mastra/agents/builder";
import { UIMessage } from "ai";

export async function getAppMessages(appId: string): Promise<UIMessage[]> {
  try {
    // Use the Mastra builder agent to get app messages
    const threadId = `app_${appId}`;
    
    // Query the memory for existing messages
    const response = await builderAgent.generate(
      "Please provide a summary of our conversation about this app and any key decisions or requirements we've discussed.",
      {
        threadId,
        resourceId: `app_${appId}`,
      }
    );
    
    // Convert the response to UIMessage format
    const messages: UIMessage[] = [
      {
        id: `summary_${appId}`,
        role: "assistant",
        content: response.text,
      },
    ];
    
    return messages;
  } catch (error) {
    console.error("Error in getAppMessages:", error);
    // Return empty array if there's an error, don't break the app
    return [];
  }
}
