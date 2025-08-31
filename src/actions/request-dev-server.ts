"use server";

import { freestyle } from "@/lib/freestyle";

export async function requestDevServer(repoId: string) {
  try {
    console.log("Requesting dev server for repo:", repoId);
    const result = await freestyle.requestDevServer({ repoId });
    console.log("Dev server requested successfully:", {
      codeServerUrl: result.codeServerUrl,
      ephemeralUrl: result.ephemeralUrl,
      mcpEphemeralUrl: result.mcpEphemeralUrl
    });
    return {
      success: true,
      codeServerUrl: result.codeServerUrl,
      ephemeralUrl: result.ephemeralUrl,
      mcpEphemeralUrl: result.mcpEphemeralUrl
    };
  } catch (error) {
    console.error("Error requesting dev server:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
