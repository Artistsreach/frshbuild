import { auth } from "firebase-admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { app } from "firebase-admin";

export async function POST(req: NextRequest) {
  const session = (await cookies()).get("session")?.value || "";
  //Validate if the session cookie is available
  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  //Use Firebase Admin to validate the session cookie
  const decodedClaims = await auth().verifySessionCookie(session, true);

  if (!decodedClaims) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  return NextResponse.json({ isLogged: true, uid: decodedClaims.uid }, { status: 200 });
}
