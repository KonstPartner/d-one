import { FirebaseError } from 'firebase/app';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { auth } from '@shared/api/firebase';

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

const CURRENT_PASSWORD_ERROR_CODES = new Set([
  'auth/invalid-credential',
  'auth/wrong-password',
]);

export const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordPayload): Promise<void> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('custom/no-user-is-currently-logged-in');
  }

  if (!user.email) {
    throw new Error('custom/no-current-user-email');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  try {
    await reauthenticateWithCredential(user, credential);
  } catch (error: unknown) {
    if (
      error instanceof FirebaseError &&
      CURRENT_PASSWORD_ERROR_CODES.has(error.code)
    ) {
      throw new Error('custom/invalid-credential-password');
    }

    throw error;
  }

  await updatePassword(user, newPassword);
};
