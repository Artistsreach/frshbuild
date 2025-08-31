import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  const debug = {
    hasSessionCookie: !!sessionCookie,
    sessionCookieLength: sessionCookie?.value?.length || 0,
    sessionCookieValue: sessionCookie?.value ? `${sessionCookie.value.substring(0, 20)}...` : null,
    headers: {
      cookie: request.headers.get("cookie"),
      host: request.headers.get("host"),
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
    }
  };

  if (sessionCookie && sessionCookie.value) {
    try {
      const { auth: getFirebaseAuth } = await import("@/lib/firebase-admin");
      const auth = getFirebaseAuth();

      if (auth) {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
        debug.user = {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          emailVerified: decodedClaims.email_verified,
        };
      } else {
        debug.error = "Firebase Admin auth is null";
      }
    } catch (error) {
      debug.error = `Session verification failed: ${error}`;
    }
  }

  return NextResponse.json(debug);
}
