import AsyncStorage from '@react-native-async-storage/async-storage';

import { isUserProfile } from '../model/isUserProfile';
import type { UserProfile } from '../model/types';

const LOCAL_PROFILE_KEY = 'auth.profile';

export const saveLocalUserProfile = async (
  profile: UserProfile
): Promise<void> => {
  await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
};

export const getLocalUserProfile = async (
  expectedUid: string
): Promise<UserProfile | null> => {
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

  if (!isUserProfile(parsedProfile)) {
    await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);

    return null;
  }

  if (parsedProfile.uid !== expectedUid) {
    await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);

    return null;
  }

  return parsedProfile;
};

export const removeLocalUserProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);
};
