import { cookies } from 'next/headers';
import { auth as getFirebaseAuth } from '@/lib/firebase-admin';

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value || '';

  // Verify session cookie
  if (!session) {
    return null;
  }

  const auth = getFirebaseAuth();

  if (!auth) {
    return null;
  }

  const decodedClaims = await auth.verifySessionCookie(session, true);

  if (!decodedClaims) {
    return null;
  }

  return decodedClaims;
}
