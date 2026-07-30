import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import type { UserData } from '../../../model/types';
import { auth } from '../config';

import { getUserProfile } from './getUserProfile';

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
