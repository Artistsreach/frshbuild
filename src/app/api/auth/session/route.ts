import { NextRequest, NextResponse } from "next/server";

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
