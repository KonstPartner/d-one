import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getLocalUserProfile,
  removeLocalUserProfile,
  saveLocalUserProfile,
} from '@features/auth/model/context/localProfileStorage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const userProfile = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: 'user',
  followerUserIds: [],
  followedUserId: null,
} as Parameters<typeof saveLocalUserProfile>[0];

describe('localProfileStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('saves and returns the local profile', async () => {
    await saveLocalUserProfile(userProfile);

    const result = await getLocalUserProfile(userProfile.uid);

    expect(result).toEqual(userProfile);
  });

  it('does not return a profile belonging to another user', async () => {
    await saveLocalUserProfile(userProfile);

    const result = await getLocalUserProfile('user-2');

    expect(result).toBeNull();
  });

  it('returns null when the local profile does not exist', async () => {
    const result = await getLocalUserProfile(userProfile.uid);

    expect(result).toBeNull();
  });

  it('removes the local profile', async () => {
    await saveLocalUserProfile(userProfile);
    await removeLocalUserProfile();

    const result = await getLocalUserProfile(userProfile.uid);

    expect(result).toBeNull();
  });

  it('replaces the previously stored profile', async () => {
    const secondProfile = {
      ...userProfile,
      uid: 'user-2',
      email: 'second@example.com',
      nickname: 'Second user',
    };

    await saveLocalUserProfile(userProfile);
    await saveLocalUserProfile(secondProfile);

    const firstResult = await getLocalUserProfile(userProfile.uid);

    const secondResult = await getLocalUserProfile(secondProfile.uid);

    expect(firstResult).toBeNull();
    expect(secondResult).toEqual(secondProfile);
  });
});
