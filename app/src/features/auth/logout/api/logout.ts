import { signOut } from 'firebase/auth';

import { auth } from '@shared/api';

export const logout = (): Promise<void> => {
  return signOut(auth);
};
