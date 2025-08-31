"use server";

import { UIMessage } from "ai";

export async function getAppMessages(appId: string): Promise<UIMessage[]> {
  try {
    // Note: Memory system is temporarily disabled to avoid 500 errors
    // from PostgreSQL dependencies in the memory module
    // TODO: Re-enable when memory system dependencies are resolved
    console.log("Memory system temporarily disabled, returning empty messages for app:", appId);
    return [];
  } catch (error) {
    console.error("Error in getAppMessages:", error);
    return [];
  }
}
