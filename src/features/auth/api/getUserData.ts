import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';

import { getUserProfile } from '@features/auth/api/firebase/services';
import type { UserData } from '@features/auth/model';
import {
  getLocalUserProfile,
  saveLocalUserProfile,
} from '@features/auth/model/context';
import { useNetworkStore } from '@features/network/model';

const TEMPORARY_ERROR_CODES = new Set([
  'unavailable',
  'deadline-exceeded',
  'auth/network-request-failed',
]);

const isTemporaryNetworkError = (error: unknown): boolean =>
  error instanceof FirebaseError && TEMPORARY_ERROR_CODES.has(error.code);

const getCachedUserProfile = async (uid: string): Promise<UserData> => {
  const profile = await getLocalUserProfile(uid);

  if (!profile) {
    throw new Error('custom/local-user-profile-not-found');
  }

  return profile;
};

export const getUserData = async (authUser: User): Promise<UserData> => {
  const { connectionState } = useNetworkStore.getState();

  if (connectionState === 'offline') {
    return getCachedUserProfile(authUser.uid);
  }

  try {
    const profile = await getUserProfile(authUser.uid);

    await saveLocalUserProfile(profile);

    return profile;
  } catch (error: unknown) {
    if (!isTemporaryNetworkError(error)) {
      throw error;
    }

    const cachedProfile = await getLocalUserProfile(authUser.uid);

    if (!cachedProfile) {
      throw error;
    }

    return cachedProfile;
  }
};
