import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getLocalUserProfile,
  removeLocalUserProfile,
  saveLocalUserProfile,
} from '../context/localProfileStorage';
import type { UserData } from '../types/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockedGetItem = jest.mocked(AsyncStorage.getItem);
const mockedSetItem = jest.mocked(AsyncStorage.setItem);
const mockedRemoveItem = jest.mocked(AsyncStorage.removeItem);

const profile: UserData = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: 'user',
  followerUserIds: [],
  followedUserId: null,
};

describe('localProfileStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedSetItem.mockResolvedValue(undefined);
    mockedRemoveItem.mockResolvedValue(undefined);
  });

  it('saves user profile', async () => {
    await saveLocalUserProfile(profile);

    expect(mockedSetItem).toHaveBeenCalledTimes(1);
    expect(mockedSetItem).toHaveBeenCalledWith(
      'auth.profile',
      JSON.stringify(profile)
    );
  });

  it('returns stored profile when uid matches', async () => {
    mockedGetItem.mockResolvedValue(JSON.stringify(profile));

    const result = await getLocalUserProfile(profile.uid);

    expect(result).toEqual(profile);
    expect(mockedGetItem).toHaveBeenCalledWith('auth.profile');
  });

  it('returns null when stored uid does not match expected uid', async () => {
    mockedGetItem.mockResolvedValue(JSON.stringify(profile));

    const result = await getLocalUserProfile('another-user');

    expect(result).toBeNull();
  });

  it('returns null when profile is not stored', async () => {
    mockedGetItem.mockResolvedValue(null);

    const result = await getLocalUserProfile(profile.uid);

    expect(result).toBeNull();
  });

  it('removes stored profile', async () => {
    await removeLocalUserProfile();

    expect(mockedRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockedRemoveItem).toHaveBeenCalledWith('auth.profile');
  });
});
