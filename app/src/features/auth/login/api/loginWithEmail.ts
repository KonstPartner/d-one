import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { getUserProfile, type UserProfile } from '@entities/user';
import { auth } from '@shared/api';

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

  try {
    return await getUserProfile(credential.user.uid);
  } catch (error) {
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error(
        'Failed to rollback Firebase session after login error:',
        signOutError
      );
    }

    throw error;
  }
};
