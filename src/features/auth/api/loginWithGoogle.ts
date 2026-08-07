import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import {
  getUserProfile,
  saveLocalUserProfile,
  type UserProfile,
} from '@entities/user';
import { auth } from '@shared/api/firebase';

export const loginWithGoogle = async (
  idToken: string
): Promise<UserProfile> => {
  const credential = GoogleAuthProvider.credential(idToken);

  const userCredential = await signInWithCredential(auth, credential);

  try {
    const profile = await getUserProfile(userCredential.user.uid);

    await saveLocalUserProfile(profile);

    return profile;
  } catch (error: unknown) {
    await signOut(auth);

    throw error;
  }
};
