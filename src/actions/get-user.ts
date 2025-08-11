"use server";

import { stackServerApp } from "@/auth/stack-auth";

export async function getUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl,
  };
}
