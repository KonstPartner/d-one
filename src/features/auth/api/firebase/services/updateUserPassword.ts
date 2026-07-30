import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { handleError } from '@features/shared/model';

import { auth } from '../config';

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('custom/no-user-is-currently-logged-in');
    }

    if (!user.email) {
      throw new Error('custom/no-current-user-email');
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
  } catch (error) {
    handleError(error);
  }
};
