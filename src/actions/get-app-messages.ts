"use server";

import { UIMessage } from "ai";

export async function getAppMessages(appId: string): Promise<UIMessage[]> {
  try {
    // Use the simple chat API instead of complex Mastra memory
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/${appId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch messages:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}
