import { Text } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  notifyManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import { type User } from 'firebase/auth';

import { SessionProvider } from '@entities/session';
import { type UserProfile, UserRole } from '@entities/user';
import { lightTheme } from '@shared/config';

import { AppGuard } from '../AppGuard';

type AuthStateListener = (user: User | null) => void;

const mockAuth = {
  currentUser: null as User | null,
};

const mockDb = {};

const mockOnAuthStateChanged = jest.fn();

const mockUnsubscribe = jest.fn();

const mockDoc = jest.fn();

const mockGetDoc = jest.fn();

const mockRouterReplace = jest.fn();

let mockAuthStateListener: AuthStateListener | null = null;

let mockPathname = '/diary';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),

  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

jest.mock('@shared/api', () => ({
  auth: mockAuth,
  db: mockDb,
}));

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },

  usePathname: () => mockPathname,
}));

const createUser = ({
  uid = 'user-1',
  emailVerified = true,
}: {
  uid?: string;
  emailVerified?: boolean;
} = {}): User =>
  ({
    uid,
    emailVerified,
  }) as User;

const createProfile = ({
  uid = 'user-1',
  role,
}: {
  uid?: string;
  role: UserRole | null;
}): UserProfile => ({
  uid,
  email: 'user@example.com',
  nickname: 'User',
  role,
  followerUserIds: [],
  followedUserId: null,
});

const mockRemoteProfile = (profile: UserProfile): void => {
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    data: () => profile,
  });
};

const emitAuthState = async (user: User | null): Promise<void> => {
  mockAuth.currentUser = user;

  await act(async () => {
    mockAuthStateListener?.(user);

    await Promise.resolve();
  });
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
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

const renderGuard = () => {
  const queryClient = createQueryClient();

  const result = render(
    <ThemeProvider theme={lightTheme}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AppGuard>
            <Text testID="guard-content">content</Text>
          </AppGuard>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );

  return {
    ...result,
    queryClient,
  };
};

describe('AppGuard integration', () => {
  let queryClient: QueryClient | null = null;

  beforeAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      act(callback);
    });
  });

  afterAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      callback();
    });
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await AsyncStorage.clear();

    mockAuth.currentUser = null;
    mockAuthStateListener = null;
    mockPathname = '/diary';

    mockDoc.mockReturnValue({});

    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, listener: AuthStateListener) => {
        mockAuthStateListener = listener;

        return mockUnsubscribe;
      }
    );
  });

  afterEach(() => {
    queryClient?.clear();

    queryClient = null;
  });

  it('redirects a guest from a protected route to auth without loading a profile', async () => {
    mockPathname = '/diary';

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(null);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth');
    });

    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('redirects an unverified authenticated user to auth', async () => {
    mockPathname = '/diary';

    const user = createUser({
      emailVerified: false,
    });

    const profile = createProfile({
      role: UserRole.User,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalledTimes(1);

      expect(mockRouterReplace).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects a verified user without a role to pending', async () => {
    mockPathname = '/diary';

    const user = createUser();

    const profile = createProfile({
      role: null,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/pending');
    });
  });

  it('keeps a user with the user role on the diary route', async () => {
    mockPathname = '/diary';

    const user = createUser();

    const profile = createProfile({
      role: UserRole.User,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(queryClient?.getQueryData(['user-profile', 'user-1'])).toEqual(
        profile
      );
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('keeps a user with the user role on the cloud route', async () => {
    mockPathname = '/cloud';

    const user = createUser();

    const profile = createProfile({
      role: UserRole.User,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(queryClient?.getQueryData(['user-profile', 'user-1'])).toEqual(
        profile
      );
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects a follower from cloud to follower diary', async () => {
    mockPathname = '/cloud';

    const user = createUser();

    const profile = createProfile({
      role: UserRole.Follower,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/follower-diary');
    });
  });

  it('keeps a follower on the follower diary route', async () => {
    mockPathname = '/follower-diary';

    const user = createUser();

    const profile = createProfile({
      role: UserRole.Follower,
    });

    mockRemoteProfile(profile);

    const rendered = renderGuard();

    queryClient = rendered.queryClient;

    await emitAuthState(user);

    await waitFor(() => {
      expect(queryClient?.getQueryData(['user-profile', 'user-1'])).toEqual(
        profile
      );
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
