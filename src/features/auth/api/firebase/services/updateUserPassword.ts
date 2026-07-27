import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';
import { handleError } from '@features/shared/model';

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('custom/no-user-is-currently-logged-in');
    }

    const credential = EmailAuthProvider.credential(
      user.email as string,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    handleError(error);
  }
};
