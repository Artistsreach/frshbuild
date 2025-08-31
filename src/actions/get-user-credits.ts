"use server";

import { getUser } from "@/auth/get-user";
import { doc, getDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";

export async function getUserCredits() {
  const user = await getUser();
  if (!user) {
    return 0;
  }

  const profileRef = doc(firestoreDb, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  const profile = profileSnap.data();

  return (profile?.credits as number | undefined) ?? 100;
}
