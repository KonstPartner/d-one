import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';

import { useNetworkStore } from '@features/network/model/context/store';

import { useAuth } from '../../model/context/AuthContext';
import { saveLocalUserProfile } from '../../model/context/localProfileStorage';
import { type UserData, UserRole } from '../../model/types';
import { getUserProfile } from '../firebase/services/getUserProfile';
import useAuthData from '../hooks/useAuthData';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@features/network/model/context/store', () => ({
  useNetworkStore: {
    getState: jest.fn(),
  },
}));

jest.mock('../../model/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../firebase/services/getUserProfile', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('../firebase/services/authUser', () => ({
  loginAuthUser: jest.fn(),
  registerAuthUser: jest.fn(),
}));

jest.mock('../firebase/services/createUserProfile', () => ({
  createUserProfile: jest.fn(),
}));

const mockedGetItem = jest.mocked(AsyncStorage.getItem);
const mockedSetItem = jest.mocked(AsyncStorage.setItem);
const mockedRemoveItem = jest.mocked(AsyncStorage.removeItem);

const mockedUseAuth = jest.mocked(useAuth);
const mockedGetUserProfile = jest.mocked(getUserProfile);

const mockedGetNetworkState = useNetworkStore.getState as jest.Mock;

const authUser = {
  uid: 'user-1',
  email: 'user@example.com',
  emailVerified: true,
} as User;

const secondAuthUser = {
  uid: 'user-2',
  email: 'second@example.com',
  emailVerified: true,
} as User;

const profile: UserData = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: UserRole.User,
  followerUserIds: [],
  followedUserId: null,
};

const secondProfile: UserData = {
  uid: 'user-2',
  email: 'second@example.com',
  nickname: 'Second user',
  role: UserRole.Follower,
  followerUserIds: [],
  followedUserId: 'user-1',
};

type AuthState = ReturnType<typeof useAuth>;

let storage: Map<string, string>;
let authState: AuthState;

const testQueryClients: QueryClient[] = [];

const createTestQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  testQueryClients.push(queryClient);

  return queryClient;
};

const createWrapper = (queryClient: QueryClient) => {
  return function TestQueryClientProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

const renderUseAuthData = (queryClient = createTestQueryClient()) => ({
  queryClient,
  hook: renderHook(() => useAuthData(), {
    wrapper: createWrapper(queryClient),
  }),
});

const setConnectionState = (
  connectionState: 'unknown' | 'offline' | 'online'
) => {
  mockedGetNetworkState.mockReturnValue({
    connectionState,
    setConnectionState: jest.fn(),
  });
};

const setAuthState = (values: Partial<AuthState> = {}) => {
  authState = {
    authUser,
    emailVerified: true,
    isAuthReady: true,
    syncAuthUser: jest.fn(),
    ...values,
  };

  mockedUseAuth.mockImplementation(() => authState);
};

describe('useAuthData integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    storage = new Map<string, string>();

    mockedGetItem.mockImplementation(async (key) => {
      return storage.get(key) ?? null;
    });

    mockedSetItem.mockImplementation(async (key, value) => {
      storage.set(key, value);
    });

    mockedRemoveItem.mockImplementation(async (key) => {
      storage.delete(key);
    });

    setAuthState();
    setConnectionState('online');

    mockedGetUserProfile.mockResolvedValue(profile);
  });

  afterEach(() => {
    cleanup();

    testQueryClients.forEach((queryClient) => {
      queryClient.clear();
    });

    testQueryClients.length = 0;
  });

  afterAll(() => {
    testQueryClients.forEach((queryClient) => {
      queryClient.clear();
    });

    testQueryClients.length = 0;
  });

  it('loads remote profile and persists it through local storage', async () => {
    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isSuccess).toBe(true);
    });

    expect(hook.result.current.authData).toEqual(profile);

    expect(mockedGetUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);

    expect(mockedSetItem).toHaveBeenCalledTimes(1);

    const savedValue = mockedSetItem.mock.calls[0]?.[1];

    expect(savedValue).toBeDefined();
    expect(JSON.parse(savedValue as string)).toEqual(profile);
  });

  it('restores loaded profile after restart while offline', async () => {
    const onlineResult = renderUseAuthData();

    await waitFor(() => {
      expect(onlineResult.hook.result.current.isSuccess).toBe(true);
    });

    onlineResult.hook.unmount();
    onlineResult.queryClient.clear();

    expect(storage.size).toBe(1);

    mockedGetUserProfile.mockClear();
    mockedGetItem.mockClear();

    setConnectionState('offline');

    const offlineResult = renderUseAuthData();

    await waitFor(() => {
      expect(offlineResult.hook.result.current.isSuccess).toBe(true);
    });

    expect(offlineResult.hook.result.current.authData).toEqual(profile);

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedGetItem).toHaveBeenCalledTimes(1);
  });

  it('rejects offline access when cached profile belongs to another user', async () => {
    await saveLocalUserProfile(profile);

    setAuthState({
      authUser: secondAuthUser,
    });

    setConnectionState('offline');

    mockedGetUserProfile.mockClear();

    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isError).toBe(true);
    });

    expect(hook.result.current.authData).toBeUndefined();

    expect(hook.result.current.error).toEqual(
      expect.objectContaining({
        message: 'custom/local-user-profile-not-found',
      })
    );

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
  });

  it.each(['unavailable', 'deadline-exceeded', 'auth/network-request-failed'])(
    'uses local profile after temporary error %s',
    async (code) => {
      await saveLocalUserProfile(profile);

      mockedGetItem.mockClear();
      mockedSetItem.mockClear();

      mockedGetUserProfile.mockRejectedValue({
        code,
      });

      const { hook } = renderUseAuthData();

      await waitFor(() => {
        expect(hook.result.current.isSuccess).toBe(true);
      });

      expect(hook.result.current.authData).toEqual(profile);

      expect(mockedGetItem).toHaveBeenCalledTimes(1);
      expect(mockedSetItem).not.toHaveBeenCalled();
    }
  );

  it('does not use local profile after permission-denied', async () => {
    await saveLocalUserProfile(profile);

    mockedGetItem.mockClear();
    mockedSetItem.mockClear();

    const permissionError = {
      code: 'permission-denied',
    };

    mockedGetUserProfile.mockRejectedValue(permissionError);

    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isError).toBe(true);
    });

    expect(hook.result.current.error).toBe(permissionError);

    expect(hook.result.current.authData).toBeUndefined();
    expect(mockedGetItem).not.toHaveBeenCalled();
    expect(mockedSetItem).not.toHaveBeenCalled();
  });

  it('does not use local profile when remote profile is missing', async () => {
    await saveLocalUserProfile(profile);

    mockedGetItem.mockClear();

    const profileError = new Error('custom/user-profile-not-found');

    mockedGetUserProfile.mockRejectedValue(profileError);

    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isError).toBe(true);
    });

    expect(hook.result.current.error).toBe(profileError);
    expect(mockedGetItem).not.toHaveBeenCalled();
  });

  it('returns an error offline when no local profile exists', async () => {
    setConnectionState('offline');

    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isError).toBe(true);
    });

    expect(hook.result.current.error).toEqual(
      expect.objectContaining({
        message: 'custom/local-user-profile-not-found',
      })
    );

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedSetItem).not.toHaveBeenCalled();
  });

  it('tries remote profile when network state is unknown', async () => {
    setConnectionState('unknown');

    const { hook } = renderUseAuthData();

    await waitFor(() => {
      expect(hook.result.current.isSuccess).toBe(true);
    });

    expect(hook.result.current.authData).toEqual(profile);

    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);

    expect(mockedSetItem).toHaveBeenCalledTimes(1);
  });

  it('does not request profile before auth initialization is ready', async () => {
    setAuthState({
      isAuthReady: false,
    });

    const { hook } = renderUseAuthData();

    expect(hook.result.current.isAuthLoading).toBe(true);
    expect(hook.result.current.fetchStatus).toBe('idle');

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedGetItem).not.toHaveBeenCalled();
  });

  it('does not request profile when Firebase user is absent', async () => {
    setAuthState({
      authUser: null,
      emailVerified: false,
      isAuthReady: true,
    });

    const { hook } = renderUseAuthData();

    expect(hook.result.current.isAuthLoading).toBe(false);
    expect(hook.result.current.authData).toBeUndefined();
    expect(hook.result.current.fetchStatus).toBe('idle');

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedGetItem).not.toHaveBeenCalled();
  });

  it('reuses React Query cache after component remount', async () => {
    const queryClient = createTestQueryClient();

    const firstRender = renderUseAuthData(queryClient);

    await waitFor(() => {
      expect(firstRender.hook.result.current.isSuccess).toBe(true);
    });

    expect(mockedGetUserProfile).toHaveBeenCalledTimes(1);

    firstRender.hook.unmount();

    mockedGetUserProfile.mockClear();
    mockedGetItem.mockClear();
    mockedSetItem.mockClear();

    const secondRender = renderUseAuthData(queryClient);

    await waitFor(() => {
      expect(secondRender.hook.result.current.isSuccess).toBe(true);
    });

    expect(secondRender.hook.result.current.authData).toEqual(profile);

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedGetItem).not.toHaveBeenCalled();
    expect(mockedSetItem).not.toHaveBeenCalled();
  });

  it('loads a separate profile when Firebase user changes', async () => {
    mockedGetUserProfile.mockImplementation(async (uid) => {
      if (uid === authUser.uid) {
        return profile;
      }

      if (uid === secondAuthUser.uid) {
        return secondProfile;
      }

      throw new Error('unexpected-user');
    });

    const queryClient = createTestQueryClient();

    const { hook } = renderUseAuthData(queryClient);

    await waitFor(() => {
      expect(hook.result.current.authData).toEqual(profile);
    });

    act(() => {
      authState = {
        ...authState,
        authUser: secondAuthUser,
      };

      hook.rerender(undefined);
    });

    await waitFor(() => {
      expect(hook.result.current.authData).toEqual(secondProfile);
    });

    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);

    expect(mockedGetUserProfile).toHaveBeenCalledWith(secondAuthUser.uid);

    expect(mockedGetUserProfile).toHaveBeenCalledTimes(2);

    const savedProfiles = mockedSetItem.mock.calls.map(
      ([, value]) => JSON.parse(value) as UserData
    );

    expect(savedProfiles).toContainEqual(profile);
    expect(savedProfiles).toContainEqual(secondProfile);
  });
});
