import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserData } from '../types';

const LOCAL_PROFILE_KEY = 'auth.profile';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'string' && item.length > 0);

const isUserRole = (value: unknown): value is UserData['role'] =>
  value === null || value === 'user' || value === 'follower';

const isUserData = (value: unknown): value is UserData => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;

  const followedUserIdIsValid =
    profile.followedUserId === null ||
    typeof profile.followedUserId === 'string';

  return (
    typeof profile.uid === 'string' &&
    profile.uid.length > 0 &&
    typeof profile.email === 'string' &&
    typeof profile.nickname === 'string' &&
    isUserRole(profile.role) &&
    isStringArray(profile.followerUserIds) &&
    followedUserIdIsValid
  );
};

export const saveLocalUserProfile = async (
  profile: UserData
): Promise<void> => {
  await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
};

export const getLocalUserProfile = async (
  expectedUid: string
): Promise<UserData | null> => {
  const storedProfile = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);

  if (!storedProfile) {
    return null;
  }

  let parsedProfile: unknown;

  try {
    parsedProfile = JSON.parse(storedProfile);
  } catch {
    await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);

    return null;
  }

  if (!isUserData(parsedProfile)) {
    await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);

    return null;
  }

  if (parsedProfile.uid !== expectedUid) {
    return null;
  }

  return parsedProfile;
};

export const removeLocalUserProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);
};
