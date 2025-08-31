import { cookies } from 'next/headers';
import { auth } from '@/lib/firebaseAdmin';

export async function getUser() {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
