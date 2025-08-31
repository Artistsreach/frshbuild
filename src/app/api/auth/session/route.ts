import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (sessionCookie && sessionCookie.value) {
    const sessionValue = sessionCookie.value;
    try {
      const { auth: getFirebaseAuth } = await import("@/lib/firebase-admin");
      const auth = getFirebaseAuth();

      if (!auth) {
        return NextResponse.json(
          { error: "Authentication service not available" },
          { status: 503 }
        );
      }

      const decodedClaims = await auth.verifySessionCookie(sessionValue, true);
      return NextResponse.json({
        isAuthenticated: true,
        user: decodedClaims,
      });
    } catch (error) {
      // Session cookie is invalid, clear it.
      const response = NextResponse.json({ isAuthenticated: false });
      response.cookies.set("session", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  return NextResponse.json({ isAuthenticated: false });
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided" }, { status: 400 });
    }

    // Try to import Firebase Admin dynamically to avoid build-time errors
    let auth;
    try {
      const { auth: getFirebaseAuth } = await import("@/lib/firebase-admin");
      auth = getFirebaseAuth();
    } catch (error) {
      console.error("Firebase Admin not available:", error);
      return NextResponse.json({ 
        error: "Authentication service temporarily unavailable",
        fallback: true 
      }, { status: 503 });
    }

    if (!auth) {
      return NextResponse.json({ 
        error: "Authentication service could not be initialized",
        fallback: true 
      }, { status: 503 });
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create session",
      fallback: true 
    }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return response;
}
