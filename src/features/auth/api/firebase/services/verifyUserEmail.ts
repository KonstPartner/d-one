import { sendEmailVerification } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';

export const verifyUserEmail = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('custom/no-user-is-currently-logged-in');
  }

  await sendEmailVerification(user);
};
