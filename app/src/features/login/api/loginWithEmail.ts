import { signInWithEmailAndPassword } from 'firebase/auth';

import { getUserProfile, type UserProfile } from '@entities/user';
import { auth } from '@shared/api/firebase';

export type LoginCredentials = {
  email: string;
  password: string;
};

export const loginWithEmail = async ({
  email,
  password,
}: LoginCredentials): Promise<UserProfile> => {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return getUserProfile(credential.user.uid);
};
