import type { User } from 'firebase/auth';

import { useNetworkStore } from '@features/network/model/context/store';

import {
  getLocalUserProfile,
  saveLocalUserProfile,
} from '../model/context/localProfileStorage';
import type { UserData } from '../model/types/auth';

import { getUserProfile } from './firebase/services/getUserProfile';

const TEMPORARY_ERROR_CODES = new Set([
  'unavailable',
  'deadline-exceeded',
  'auth/network-request-failed',
]);

const hasErrorCode = (error: unknown): error is { code: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'string';

const isTemporaryNetworkError = (error: unknown): boolean =>
  hasErrorCode(error) && TEMPORARY_ERROR_CODES.has(error.code);

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
