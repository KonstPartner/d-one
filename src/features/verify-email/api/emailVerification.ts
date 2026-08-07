import { sendEmailVerification } from 'firebase/auth';

import { auth } from '@shared/api/firebase';

const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('custom/no-user-is-currently-logged-in');
  }

  return user;
};

export const sendVerificationEmail = async (): Promise<void> => {
  const user = getCurrentUser();

  await sendEmailVerification(user);
};

export const checkEmailVerification = async (): Promise<boolean> => {
  const user = getCurrentUser();

  await user.reload();

  if (!user.emailVerified) {
    return false;
  }

  await user.getIdToken(true);

  return true;
};
