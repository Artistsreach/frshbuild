"use server";

import { freestyle } from "@/lib/freestyle";

export async function createFreestyleIdentity() {
  try {
    console.log("Creating freestyleIdentity on server side");
    const identity = await freestyle.createGitIdentity();
    console.log("FreestyleIdentity created successfully:", identity.id);
    return { success: true, identityId: identity.id };
  } catch (error) {
    console.error("Error creating freestyleIdentity on server:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
