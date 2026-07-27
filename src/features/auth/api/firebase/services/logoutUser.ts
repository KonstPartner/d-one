import { signOut } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';
import { handleError } from '@features/shared/model';

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    handleError(error);
  }
};
