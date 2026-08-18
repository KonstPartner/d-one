import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { getUserProfile, type UserProfile } from '@entities/user';
import { auth } from '@shared/api';

export const loginWithGoogle = async (
  idToken: string
): Promise<UserProfile> => {
  const credential = GoogleAuthProvider.credential(idToken);

  const userCredential = await signInWithCredential(auth, credential);

  try {
    return await getUserProfile(userCredential.user.uid);
  } catch (error: unknown) {
    await signOut(auth);

    throw error;
  }
};
