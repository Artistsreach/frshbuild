"use server";

import { stackServerApp } from "@/auth/stack-auth";

export async function getUserCredits() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return 0;
  }
  return (user.serverMetadata?.credits as number | undefined) ?? 100;
}
