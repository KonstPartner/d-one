import { doc, getDoc } from 'firebase/firestore';

import { db } from '@features/auth/api/firebase/config';
import type { UserData } from '@features/auth/model';

export const getUserProfile = async (uid: string): Promise<UserData> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-not-found');
  }

  return snapshot.data() as UserData;
};
