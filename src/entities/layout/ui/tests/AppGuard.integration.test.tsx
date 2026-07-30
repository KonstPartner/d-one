import { Text } from 'react-native';
import { useTheme } from '@emotion/react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { router, usePathname } from 'expo-router';
import type { User } from 'firebase/auth';

import useAuthData from '@features/auth/api/hooks/useAuthData';
import { useAuth } from '@features/auth/model/context/AuthContext';
import { getGuardRedirectPath, isSamePath } from '@features/layout/model';

import AppGuard from '../AppGuard';

jest.mock('@emotion/react', () => ({
  useTheme: jest.fn(),
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

jest.mock('@features/auth/api/hooks/useAuthData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@features/auth/model/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@features/layout/model', () => ({
  getGuardRedirectPath: jest.fn(),
  isSamePath: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);
const mockedUsePathname = jest.mocked(usePathname);
const mockedRouterReplace = jest.mocked(router.replace);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseAuthData = jest.mocked(useAuthData);

const mockedGetGuardRedirectPath = jest.mocked(getGuardRedirectPath);

const mockedIsSamePath = jest.mocked(isSamePath);

const authUser = {
  uid: 'user-1',
  email: 'user@example.com',
  emailVerified: true,
} as User;

const profile = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: 'user',
  followerUserIds: [],
  followedUserId: null,
} as const;

const renderGuard = () =>
  render(
    <AppGuard>
      <Text testID="protected-content">Protected content</Text>
    </AppGuard>
  );

describe('AppGuard integration', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: (timestamp: number) => void) => {
        callback(0);

        return 1;
      }),
    });

    Object.defineProperty(global, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseTheme.mockReturnValue({
      colors: {
        bg: '#ffffff',
      },
    } as ReturnType<typeof useTheme>);

    mockedUsePathname.mockReturnValue('/diary');

    mockedUseAuth.mockReturnValue({
      authUser,
      emailVerified: true,
      isAuthReady: true,
      syncAuthUser: jest.fn(),
    });

    mockedUseAuthData.mockReturnValue({
      authData: profile,
      isAuthLoading: false,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    mockedGetGuardRedirectPath.mockReturnValue(null);

    mockedIsSamePath.mockImplementation(
      (firstPath, secondPath) => firstPath === secondPath
    );
  });

  it('renders protected content when route is allowed', () => {
    renderGuard();

    expect(screen.getByTestId('protected-content')).toBeTruthy();

    expect(screen.queryByTestId('loading-view')).toBeNull();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('passes current auth state to route resolver', () => {
    renderGuard();

    expect(mockedGetGuardRedirectPath).toHaveBeenCalledWith({
      pathname: '/diary',
      hasAuthUser: true,
      emailVerified: true,
      authRole: 'user',
    });
  });

  it('shows loading state while auth data is loading', () => {
    mockedUseAuthData.mockReturnValue({
      authData: undefined,
      isAuthLoading: true,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    renderGuard();

    expect(screen.getByTestId('loading-view')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('shows loading state when auth data request fails', () => {
    mockedUseAuthData.mockReturnValue({
      authData: undefined,
      isAuthLoading: false,
      isAuthMutating: false,
      isError: true,
    } as unknown as ReturnType<typeof useAuthData>);

    renderGuard();

    expect(screen.getByTestId('loading-view')).toBeTruthy();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects authenticated pending user', async () => {
    mockedUseAuthData.mockReturnValue({
      authData: {
        ...profile,
        role: null,
      },
      isAuthLoading: false,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    mockedGetGuardRedirectPath.mockReturnValue(
      '/pending' as ReturnType<typeof getGuardRedirectPath>
    );

    renderGuard();

    await waitFor(() => {
      expect(mockedRouterReplace).toHaveBeenCalledWith('/pending');
    });

    expect(screen.getByTestId('loading-view')).toBeTruthy();
  });

  it('redirects unauthenticated user to login route', async () => {
    mockedUseAuth.mockReturnValue({
      authUser: null,
      emailVerified: false,
      isAuthReady: true,
      syncAuthUser: jest.fn(),
    });

    mockedUseAuthData.mockReturnValue({
      authData: undefined,
      isAuthLoading: false,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    mockedGetGuardRedirectPath.mockReturnValue(
      '/login' as ReturnType<typeof getGuardRedirectPath>
    );

    renderGuard();

    expect(mockedGetGuardRedirectPath).toHaveBeenCalledWith({
      pathname: '/diary',
      hasAuthUser: false,
      emailVerified: false,
      authRole: null,
    });

    await waitFor(() => {
      expect(mockedRouterReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('does not redirect when resolved route equals current pathname', () => {
    mockedGetGuardRedirectPath.mockReturnValue(
      '/diary' as ReturnType<typeof getGuardRedirectPath>
    );

    renderGuard();

    expect(mockedIsSamePath).toHaveBeenCalledWith('/diary', '/diary');

    expect(mockedRouterReplace).not.toHaveBeenCalled();

    expect(screen.getByTestId('protected-content')).toBeTruthy();
  });

  it('passes follower role to route resolver', () => {
    mockedUseAuthData.mockReturnValue({
      authData: {
        ...profile,
        role: 'follower',
      },
      isAuthLoading: false,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    renderGuard();

    expect(mockedGetGuardRedirectPath).toHaveBeenCalledWith({
      pathname: '/diary',
      hasAuthUser: true,
      emailVerified: true,
      authRole: 'follower',
    });
  });

  it('does not resolve route until authenticated profile exists', () => {
    mockedUseAuthData.mockReturnValue({
      authData: undefined,
      isAuthLoading: false,
      isAuthMutating: false,
      isError: false,
    } as unknown as ReturnType<typeof useAuthData>);

    renderGuard();

    expect(mockedGetGuardRedirectPath).not.toHaveBeenCalled();

    expect(mockedRouterReplace).not.toHaveBeenCalled();
  });
});
