"use server";

import { memory } from "@/mastra/agents/builder";
import { UIMessage } from "ai";

export async function getAppMessages(appId: string): Promise<UIMessage[]> {
  try {
    const result = await memory.query({
      threadId: appId,
      resourceId: appId,
    });
    return result.uiMessages || [];
  } catch (error) {
    console.error("Error querying memory:", error);
    return [];
  }
}
