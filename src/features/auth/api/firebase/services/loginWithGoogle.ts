import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';
import { getUserProfile } from '@features/auth/api/firebase/services/getUserProfile';
import type { UserData } from '@features/auth/model/types';

export const loginWithGoogle = async (idToken: string): Promise<UserData> => {
  const credential = GoogleAuthProvider.credential(idToken);

  const userCredential = await signInWithCredential(auth, credential);

  try {
    return await getUserProfile(userCredential.user.uid);
  } catch (error) {
    await signOut(auth);

    throw error;
  }
};
