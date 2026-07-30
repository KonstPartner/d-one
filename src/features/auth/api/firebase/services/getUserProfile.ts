import { doc, getDoc } from 'firebase/firestore';

import type { UserData } from '../../../model';
import { db } from '../config';

export const getUserProfile = async (uid: string): Promise<UserData> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-not-found');
  }

  return snapshot.data() as UserData;
};
