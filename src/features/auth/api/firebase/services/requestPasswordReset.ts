import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';

export const requestPasswordReset = (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email.trim());
};
