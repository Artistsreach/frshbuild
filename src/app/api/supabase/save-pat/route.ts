import "server-only";
import { NextResponse } from "next/server";
import { getUser } from "@/auth/get-user";
import { doc, updateDoc } from "firebase/firestore";
import { db as firestoreDb } from "@/lib/firebaseClient";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pat } = await req.json();
    if (typeof pat !== "string" || !pat.trim()) {
      return NextResponse.json({ error: "Invalid PAT" }, { status: 400 });
    }

    // Optional: simple validation call to Supabase Management API
    // We don't fail on network error; we just store the PAT.
    // await fetch("https://api.supabase.com/v1/projects", { headers: { Authorization: `Bearer ${pat}` } });

    const profileRef = doc(firestoreDb, "profiles", user.uid);
    await updateDoc(profileRef, {
      supabasePat: pat,
      supabaseConnectedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
