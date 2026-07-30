import { Pressable, Text, View } from 'react-native';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from '../../api/firebase/config';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { clearAuthSessionData } from '../utils/clearAuthSessionData';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../api/firebase/config', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('../utils/clearAuthSessionData', () => ({
  clearAuthSessionData: jest.fn(),
}));

const mockedOnAuthStateChanged = jest.mocked(onAuthStateChanged);

const mockedClearAuthSessionData = jest.mocked(clearAuthSessionData);

const unsubscribe = jest.fn();

let emitAuthState: ((user: User | null) => void) | undefined;

const authenticatedUser = {
  uid: 'user-1',
  email: 'user@example.com',
  emailVerified: true,
} as User;

const unverifiedUser = {
  uid: 'user-2',
  email: 'unverified@example.com',
  emailVerified: false,
} as User;

const AuthStateProbe = () => {
  const { authUser, emailVerified, isAuthReady, syncAuthUser } = useAuth();

  return (
    <View>
      <Text testID="auth-user">{authUser?.uid ?? 'null'}</Text>

      <Text testID="email-verified">{String(emailVerified)}</Text>

      <Text testID="auth-ready">{String(isAuthReady)}</Text>

      <Pressable testID="sync-auth-user" onPress={syncAuthUser}>
        <Text>Sync</Text>
      </Pressable>
    </View>
  );
};

const renderProvider = () =>
  render(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>
  );

const getText = (testId: string) => screen.getByTestId(testId).props.children;

const createDeferred = () => {
  let resolve!: () => void;

  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return {
    promise,
    resolve,
  };
};

const emitUser = (user: User | null) => {
  if (!emitAuthState) {
    throw new Error('Firebase Auth observer is not initialized');
  }

  act(() => {
    emitAuthState?.(user);
  });
};

describe('AuthProvider integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    emitAuthState = undefined;

    (
      auth as {
        currentUser: User | null;
      }
    ).currentUser = null;

    mockedClearAuthSessionData.mockResolvedValue(undefined);

    (mockedOnAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        emitAuthState = callback;

        return unsubscribe;
      }
    );
  });

  afterEach(() => {
    cleanup();
    emitAuthState = undefined;
  });

  it('subscribes to Firebase Auth state changes', () => {
    renderProvider();

    expect(mockedOnAuthStateChanged).toHaveBeenCalledTimes(1);

    expect(mockedOnAuthStateChanged).toHaveBeenCalledWith(
      auth,
      expect.any(Function)
    );
  });

  it('starts with unresolved auth state', () => {
    renderProvider();

    expect(getText('auth-user')).toBe('null');
    expect(getText('email-verified')).toBe('false');
    expect(getText('auth-ready')).toBe('false');
  });

  it('applies authenticated Firebase user state', async () => {
    renderProvider();

    emitUser(authenticatedUser);

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });

    expect(getText('auth-user')).toBe('user-1');
    expect(getText('email-verified')).toBe('true');

    expect(mockedClearAuthSessionData).not.toHaveBeenCalled();
  });

  it('applies unverified Firebase user state', async () => {
    renderProvider();

    emitUser(unverifiedUser);

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });

    expect(getText('auth-user')).toBe('user-2');
    expect(getText('email-verified')).toBe('false');
  });

  it('waits for local cleanup before marking auth ready', async () => {
    const deferred = createDeferred();

    mockedClearAuthSessionData.mockReturnValue(deferred.promise);

    renderProvider();

    emitUser(null);

    expect(mockedClearAuthSessionData).toHaveBeenCalledTimes(1);

    expect(getText('auth-ready')).toBe('false');

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });

    expect(getText('auth-user')).toBe('null');
    expect(getText('email-verified')).toBe('false');
  });

  it('continues initialization when local cleanup fails', async () => {
    const error = new Error('cleanup failed');

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockedClearAuthSessionData.mockRejectedValue(error);

    renderProvider();

    emitUser(null);

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });

    expect(getText('auth-user')).toBe('null');

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to clear local auth session data:',
      error
    );

    consoleError.mockRestore();
  });

  it('resets readiness while processing a new auth state', async () => {
    const deferred = createDeferred();

    renderProvider();

    emitUser(authenticatedUser);

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });

    mockedClearAuthSessionData.mockReturnValue(deferred.promise);

    emitUser(null);

    expect(getText('auth-ready')).toBe('false');

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(getText('auth-ready')).toBe('true');
    });
  });

  it('synchronizes state from auth.currentUser', () => {
    renderProvider();

    (
      auth as {
        currentUser: User | null;
      }
    ).currentUser = authenticatedUser;

    fireEvent.press(screen.getByTestId('sync-auth-user'));

    expect(getText('auth-user')).toBe('user-1');
    expect(getText('email-verified')).toBe('true');
  });

  it('clears synchronized state when currentUser is null', () => {
    (
      auth as {
        currentUser: User | null;
      }
    ).currentUser = authenticatedUser;

    renderProvider();

    fireEvent.press(screen.getByTestId('sync-auth-user'));

    expect(getText('auth-user')).toBe('user-1');

    (
      auth as {
        currentUser: User | null;
      }
    ).currentUser = null;

    fireEvent.press(screen.getByTestId('sync-auth-user'));

    expect(getText('auth-user')).toBe('null');
    expect(getText('email-verified')).toBe('false');
  });

  it('unsubscribes from Firebase Auth on unmount', () => {
    const { unmount } = renderProvider();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('does not apply cleanup result after unmount', async () => {
    const deferred = createDeferred();

    mockedClearAuthSessionData.mockReturnValue(deferred.promise);

    const { unmount } = renderProvider();

    emitUser(null);

    unmount();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
