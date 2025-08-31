"use server";

import { memory } from "@/mastra/agents/builder";

export async function testMemory(appId: string) {
  try {
    console.log("Testing memory system for app:", appId);
    
    // Try to create a test thread
    const createResult = await memory.createThread({
      threadId: `test-${appId}`,
      resourceId: appId,
    });
    console.log("Thread creation result:", createResult);
    
    // Try to query the thread
    const queryResult = await memory.query({
      threadId: `test-${appId}`,
      resourceId: appId,
    });
    console.log("Query result:", queryResult);
    
    return {
      success: true,
      createResult,
      queryResult,
    };
  } catch (error) {
    console.error("Memory test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
