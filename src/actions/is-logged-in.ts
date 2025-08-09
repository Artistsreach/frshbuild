"use server";

import { getUser } from "@/auth/stack-auth";

export async function isLoggedIn(): Promise<boolean> {
  try {
    await getUser();
    return true;
  } catch {
    return false;
  }
}
