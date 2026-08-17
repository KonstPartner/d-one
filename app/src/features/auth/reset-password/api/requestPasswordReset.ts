import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '@shared/api';

export const requestPasswordReset = (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email.trim());
};
