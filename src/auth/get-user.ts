import { cookies } from 'next/headers';
import { auth as getFirebaseAuth } from '@/lib/firebase-admin';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value || '';

    // Verify session cookie
    if (!session) {
      console.log("No session cookie found");
      return null;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      console.warn("Firebase Admin auth is null - authentication service unavailable");
      return null;
    }

    try {
      const decodedClaims = await auth.verifySessionCookie(session, true);
      
      if (!decodedClaims) {
        console.log("Session cookie verification returned null");
        return null;
      }

      console.log("User authenticated successfully:", { uid: decodedClaims.uid });
      return decodedClaims;
    } catch (verificationError) {
      console.error("Session cookie verification failed:", verificationError);
      return null;
    }
  } catch (error) {
    console.error("Error in getUser function:", error);
    return null;
  }
}
