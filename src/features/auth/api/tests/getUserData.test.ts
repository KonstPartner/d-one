import { useNetworkStore } from '@features/network/model/context/store';

import {
  getLocalUserProfile,
  saveLocalUserProfile,
} from '../../model/context/localProfileStorage';
import type { UserData } from '../../model/types/auth';
import { UserRole } from '../../model/types/auth';
import { getUserProfile } from '../firebase/services/getUserProfile';
import { getUserData } from '../getUserData';

jest.mock('../firebase/services/getUserProfile', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('../../model/context/localProfileStorage', () => ({
  getLocalUserProfile: jest.fn(),
  saveLocalUserProfile: jest.fn(),
}));

jest.mock('@features/network/model/context/store', () => ({
  useNetworkStore: {
    getState: jest.fn(),
  },
}));

const mockedGetUserProfile = jest.mocked(getUserProfile);
const mockedGetLocalUserProfile = jest.mocked(getLocalUserProfile);
const mockedSaveLocalUserProfile = jest.mocked(saveLocalUserProfile);

const mockedGetNetworkState = useNetworkStore.getState as jest.Mock;

const authUser = {
  uid: 'user-1',
} as Parameters<typeof getUserData>[0];

const profile: UserData = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: UserRole.User,
  followerUserIds: [],
  followedUserId: null,
};

const setConnectionState = (
  connectionState: 'unknown' | 'offline' | 'online'
) => {
  mockedGetNetworkState.mockReturnValue({
    connectionState,
    setConnectionState: jest.fn(),
  });
};

describe('getUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedSaveLocalUserProfile.mockResolvedValue(undefined);
  });

  it('returns cached profile when device is offline', async () => {
    setConnectionState('offline');
    mockedGetLocalUserProfile.mockResolvedValue(profile);

    const result = await getUserData(authUser);

    expect(result).toEqual(profile);
    expect(mockedGetLocalUserProfile).toHaveBeenCalledWith(authUser.uid);
    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedSaveLocalUserProfile).not.toHaveBeenCalled();
  });

  it('throws when device is offline and cached profile does not exist', async () => {
    setConnectionState('offline');
    mockedGetLocalUserProfile.mockResolvedValue(null);

    await expect(getUserData(authUser)).rejects.toThrow(
      'custom/local-user-profile-not-found'
    );

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
  });

  it('loads remote profile and saves it locally when device is online', async () => {
    setConnectionState('online');
    mockedGetUserProfile.mockResolvedValue(profile);

    const result = await getUserData(authUser);

    expect(result).toEqual(profile);
    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);
    expect(mockedSaveLocalUserProfile).toHaveBeenCalledWith(profile);
    expect(mockedGetLocalUserProfile).not.toHaveBeenCalled();
  });

  it('tries remote request when network state is unknown', async () => {
    setConnectionState('unknown');
    mockedGetUserProfile.mockResolvedValue(profile);

    const result = await getUserData(authUser);

    expect(result).toEqual(profile);
    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);
    expect(mockedSaveLocalUserProfile).toHaveBeenCalledWith(profile);
  });

  it('uses cached profile after a temporary network error', async () => {
    const networkError = {
      code: 'unavailable',
    };

    setConnectionState('online');
    mockedGetUserProfile.mockRejectedValue(networkError);
    mockedGetLocalUserProfile.mockResolvedValue(profile);

    const result = await getUserData(authUser);

    expect(result).toEqual(profile);
    expect(mockedGetLocalUserProfile).toHaveBeenCalledWith(authUser.uid);
    expect(mockedSaveLocalUserProfile).not.toHaveBeenCalled();
  });

  it('rethrows temporary error when cached profile does not exist', async () => {
    const networkError = {
      code: 'deadline-exceeded',
    };

    setConnectionState('online');
    mockedGetUserProfile.mockRejectedValue(networkError);
    mockedGetLocalUserProfile.mockResolvedValue(null);

    await expect(getUserData(authUser)).rejects.toBe(networkError);
  });

  it('does not use cache after a non-temporary Firebase error', async () => {
    const permissionError = {
      code: 'permission-denied',
    };

    setConnectionState('online');
    mockedGetUserProfile.mockRejectedValue(permissionError);

    await expect(getUserData(authUser)).rejects.toBe(permissionError);

    expect(mockedGetLocalUserProfile).not.toHaveBeenCalled();
    expect(mockedSaveLocalUserProfile).not.toHaveBeenCalled();
  });
});
