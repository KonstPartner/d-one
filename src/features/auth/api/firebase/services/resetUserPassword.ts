import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';
import { handleError } from '@features/shared/model';

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (error) {
    handleError(error);
  }
}
