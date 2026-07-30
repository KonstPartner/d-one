import { Text } from 'react-native';
import { useTheme } from '@emotion/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { router, usePathname } from 'expo-router';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { userQueryKeys } from '@features/auth/api/constants';
import { auth } from '@features/auth/api/firebase/config';
import { getUserProfile } from '@features/auth/api/firebase/services/getUserProfile';
import { AuthProvider } from '@features/auth/model/context/AuthContext';
import { saveLocalUserProfile } from '@features/auth/model/context/localProfileStorage';
import { type UserData, UserRole } from '@features/auth/model/types';
import { getGuardRedirectPath } from '@features/layout/model';
import { useNetworkStore } from '@features/network/model/context/store';
import { queryClient } from '@features/shared/api/queryClient';

import AppGuard from '../AppGuard';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/config', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('@features/auth/api/firebase/services/getUserProfile', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/services', () => ({
  loginAuthUser: jest.fn(),
  registerAuthUser: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/services/createUserProfile', () => ({
  createUserProfile: jest.fn(),
}));

jest.mock('@features/network/model/context/store', () => ({
  useNetworkStore: {
    getState: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@emotion/react', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@features/shared/model', () => ({
  PlatformOS: {
    WEB: false,
  },
}));

jest.mock('@features/auth/model', () => ({
  UserRole: {
    User: 'user',
    Follower: 'follower',
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
  usePathname: jest.fn(),
}));

jest.mock('@entities/shared/ui', () => {
  const React = jest.requireActual('react');
  const { Text: NativeText } = jest.requireActual('react-native');

  return {
    LoadingView: ({ loading }: { loading: boolean }) =>
      loading
        ? React.createElement(
            NativeText,
            {
              testID: 'loading-view',
            },
            'loading'
          )
        : null,
  };
});

jest.mock('@features/shared/api/queryClient', () => {
  const { QueryClient: ActualQueryClient } = jest.requireActual(
    '@tanstack/react-query'
  );

  return {
    queryClient: new ActualQueryClient({
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
    }),
  };
});

jest.mock('@features/shared/api/constants', () => ({
  FORCE_CACHE: {
    staleTime: Infinity,
    gcTime: Infinity,
  },
}));

jest.mock('@features/shared/api', () => {
  const { queryClient: mockedQueryClient } = jest.requireMock(
    '@features/shared/api/queryClient'
  );

  return {
    FORCE_CACHE: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
    queryClient: mockedQueryClient,
  };
});

const mockedOnAuthStateChanged = jest.mocked(onAuthStateChanged);

const mockedGetUserProfile = jest.mocked(getUserProfile);

const mockedGetItem = jest.mocked(AsyncStorage.getItem);

const mockedSetItem = jest.mocked(AsyncStorage.setItem);

const mockedRemoveItem = jest.mocked(AsyncStorage.removeItem);

const mockedUseTheme = jest.mocked(useTheme);
const mockedUsePathname = jest.mocked(usePathname);

const mockedRouterReplace = jest.mocked(router.replace);

const mockedGetNetworkState = useNetworkStore.getState as jest.Mock;

const unsubscribe = jest.fn();

let emitAuthState: ((user: User | null) => void) | undefined;

let storage: Map<string, string>;

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

const pendingProfile: UserData = {
  ...profile,
  role: null,
};

const setConnectionState = (
  connectionState: 'unknown' | 'offline' | 'online'
) => {
  mockedGetNetworkState.mockReturnValue({
    connectionState,
    setConnectionState: jest.fn(),
  });
};

const emitUser = (user: User | null) => {
  if (!emitAuthState) {
    throw new Error('Firebase Auth observer is not initialized');
  }

  act(() => {
    emitAuthState?.(user);
  });
};

const renderAuthFlow = () =>
  render(
    <QueryClientProvider client={queryClient as QueryClient}>
      <AuthProvider>
        <AppGuard>
          <Text testID="protected-content">Protected content</Text>
        </AppGuard>
      </AuthProvider>
    </QueryClientProvider>
  );

describe('Auth flow integration', () => {
  const originalRequestAnimationFrame = global.requestAnimationFrame;

  const originalCancelAnimationFrame = global.cancelAnimationFrame;

  beforeAll(() => {
    global.requestAnimationFrame = ((callback) => {
      callback(0);

      return 1;
    }) as typeof requestAnimationFrame;

    global.cancelAnimationFrame = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    queryClient.clear();
    emitAuthState = undefined;

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

    mockedUseTheme.mockReturnValue({
      colors: {
        bg: '#ffffff',
      },
    } as ReturnType<typeof useTheme>);

    mockedUsePathname.mockReturnValue('/diary');

    mockedGetUserProfile.mockResolvedValue(profile);

    setConnectionState('online');

    (
      auth as {
        currentUser: User | null;
      }
    ).currentUser = null;

    (mockedOnAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        emitAuthState = callback;

        return unsubscribe;
      }
    );
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    emitAuthState = undefined;
  });

  afterAll(() => {
    cleanup();
    queryClient.clear();

    global.requestAnimationFrame = originalRequestAnimationFrame;

    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('loads remote profile, stores it locally and opens protected route', async () => {
    renderAuthFlow();

    emitUser(authUser);

    await waitFor(() => {
      expect(
        queryClient.getQueryState(userQueryKeys.userData(authUser.uid))?.status
      ).toBe('success');
    });

    expect(mockedGetUserProfile).toHaveBeenCalledWith(authUser.uid);

    expect(mockedSetItem).toHaveBeenCalledTimes(1);

    const storedValue = mockedSetItem.mock.calls[0]?.[1];

    expect(storedValue).toBeDefined();
    expect(JSON.parse(storedValue as string)).toEqual(profile);

    expect(screen.queryByTestId('loading-view')).toBeNull();

    expect(screen.getByTestId('protected-content')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('opens protected route offline using persisted profile', async () => {
    await saveLocalUserProfile(profile);

    mockedGetItem.mockClear();
    mockedSetItem.mockClear();

    setConnectionState('offline');

    renderAuthFlow();

    emitUser(authUser);

    await waitFor(() => {
      expect(
        queryClient.getQueryState(userQueryKeys.userData(authUser.uid))?.status
      ).toBe('success');
    });

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedGetItem).toHaveBeenCalledTimes(1);

    expect(screen.queryByTestId('loading-view')).toBeNull();

    expect(screen.getByTestId('protected-content')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('rejects offline access when local profile does not exist', async () => {
    setConnectionState('offline');

    renderAuthFlow();

    emitUser(authUser);

    await waitFor(() => {
      expect(
        queryClient.getQueryState(userQueryKeys.userData(authUser.uid))?.status
      ).toBe('error');
    });

    expect(mockedGetUserProfile).not.toHaveBeenCalled();

    expect(screen.getByTestId('loading-view')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('rejects offline profile belonging to another user', async () => {
    await saveLocalUserProfile(profile);

    mockedGetItem.mockClear();
    mockedSetItem.mockClear();

    setConnectionState('offline');

    renderAuthFlow();

    emitUser(secondAuthUser);

    await waitFor(() => {
      expect(
        queryClient.getQueryState(userQueryKeys.userData(secondAuthUser.uid))
          ?.status
      ).toBe('error');
    });

    expect(mockedGetUserProfile).not.toHaveBeenCalled();

    expect(screen.getByTestId('loading-view')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('does not use local profile after permission-denied', async () => {
    await saveLocalUserProfile(profile);

    mockedGetItem.mockClear();

    const permissionError = {
      code: 'permission-denied',
    };

    mockedGetUserProfile.mockRejectedValue(permissionError);

    renderAuthFlow();

    emitUser(authUser);

    await waitFor(() => {
      expect(
        queryClient.getQueryState(userQueryKeys.userData(authUser.uid))?.status
      ).toBe('error');
    });

    expect(mockedGetItem).not.toHaveBeenCalled();

    expect(screen.getByTestId('loading-view')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects authenticated user with null role to pending route', async () => {
    mockedGetUserProfile.mockResolvedValue(pendingProfile);

    const expectedRedirect = getGuardRedirectPath({
      pathname: '/diary',
      hasAuthUser: true,
      emailVerified: true,
      authRole: null,
    });

    expect(expectedRedirect).not.toBeNull();

    renderAuthFlow();

    emitUser(authUser);

    await waitFor(() => {
      expect(mockedRouterReplace).toHaveBeenCalledWith(expectedRedirect);
    });
  });

  it('clears local profile and React Query data after logout', async () => {
    await saveLocalUserProfile(profile);

    queryClient.setQueryData(userQueryKeys.userData(authUser.uid), profile);

    mockedRemoveItem.mockClear();

    const expectedRedirect = getGuardRedirectPath({
      pathname: '/diary',
      hasAuthUser: false,
      emailVerified: false,
      authRole: null,
    });

    expect(expectedRedirect).not.toBeNull();

    renderAuthFlow();

    emitUser(null);

    await waitFor(() => {
      expect(mockedRemoveItem).toHaveBeenCalledWith('auth.profile');
    });

    await waitFor(() => {
      expect(mockedRouterReplace).toHaveBeenCalledWith(expectedRedirect);
    });

    expect(
      queryClient.getQueryData(userQueryKeys.userData(authUser.uid))
    ).toBeUndefined();

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
  });
});
