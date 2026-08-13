import { doc, getDoc } from 'firebase/firestore';

import { db } from '@shared/api/firebase';

import { isUserProfile } from '../model/isUserProfile';
import type { UserProfile } from '../model/types';

import {
  getLocalUserProfile,
  saveLocalUserProfile,
} from './localUserProfileStorage';

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

const getRemoteUserProfile = async (uid: string): Promise<UserProfile> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-not-found');
  }

  const profile: unknown = snapshot.data();

  if (!isUserProfile(profile)) {
    throw new Error('custom/invalid-user-profile');
  }

  return profile;
};

const cacheUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await saveLocalUserProfile(profile);
  } catch (error: unknown) {
    console.error('Failed to cache user profile:', error);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
  try {
    const profile = await getRemoteUserProfile(uid);

    await cacheUserProfile(profile);

    return profile;
  } catch (error: unknown) {
    if (!isTemporaryNetworkError(error)) {
      throw error;
    }

    const cachedProfile = await getLocalUserProfile(uid);

    if (!cachedProfile) {
      throw error;
    }

    return cachedProfile;
  }
};
