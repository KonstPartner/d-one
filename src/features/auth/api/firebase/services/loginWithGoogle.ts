import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { saveLocalUserProfile } from '../../../model/context/localProfileStorage';
import type { UserData } from '../../../model/types';
import { auth } from '../config';

import { getUserProfile } from './getUserProfile';

export const loginWithGoogle = async (idToken: string): Promise<UserData> => {
  const credential = GoogleAuthProvider.credential(idToken);

  const userCredential = await signInWithCredential(auth, credential);

  try {
    const profile = await getUserProfile(userCredential.user.uid);

    await saveLocalUserProfile(profile);

    return profile;
  } catch (error) {
    await signOut(auth);

    throw error;
  }
};
