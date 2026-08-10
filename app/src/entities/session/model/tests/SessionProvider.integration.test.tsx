import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { type User } from 'firebase/auth';

import { SessionProvider, useSession } from '../SessionProvider';

type AuthStateListener = (user: User | null) => void;

const mockOnAuthStateChanged = jest.fn();

const mockUnsubscribe = jest.fn();

let mockAuthStateListener: AuthStateListener | null = null;

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

const mockAuthState = {
  currentUser: null as User | null,
};

jest.mock('@shared/api/firebase', () => ({
  auth: {
    get currentUser() {
      return mockAuthState.currentUser;
    },
  },
}));

const createUser = (uid: string, emailVerified = false): User =>
  ({
    uid,
    emailVerified,
  }) as User;

const SessionProbe = () => {
  const { sessionUser, emailVerified, isSessionReady, syncSessionUser } =
    useSession();

  return (
    <View>
      <Text testID="session-user">{sessionUser?.uid ?? 'none'}</Text>

      <Text testID="email-verified">{String(emailVerified)}</Text>

      <Text testID="session-ready">{String(isSessionReady)}</Text>

      <Pressable testID="sync-session" onPress={syncSessionUser} />
    </View>
  );
};

const renderSession = ({
  onUnauthenticated,
}: {
  onUnauthenticated?: () => Promise<void> | void;
} = {}) =>
  render(
    <SessionProvider onUnauthenticated={onUnauthenticated}>
      <SessionProbe />
    </SessionProvider>
  );

const emitAuthState = async (user: User | null): Promise<void> => {
  mockAuthState.currentUser = user;

  await act(async () => {
    mockAuthStateListener?.(user);

    await Promise.resolve();
  });
};

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

describe('SessionProvider integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthState.currentUser = null;
    mockAuthStateListener = null;

    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, listener: AuthStateListener) => {
        mockAuthStateListener = listener;

        return mockUnsubscribe;
      }
    );
  });

  it('starts not ready and applies authenticated Firebase session', async () => {
    const user = createUser('user-1', true);

    const { getByTestId } = renderSession();

    expect(getByTestId('session-user').props.children).toBe('none');

    expect(getByTestId('email-verified').props.children).toBe('false');

    expect(getByTestId('session-ready').props.children).toBe('false');

    await emitAuthState(user);

    expect(getByTestId('session-user').props.children).toBe('user-1');

    expect(getByTestId('email-verified').props.children).toBe('true');

    expect(getByTestId('session-ready').props.children).toBe('true');
  });

  it('syncs session from auth.currentUser', async () => {
    const firstUser = createUser('user-1', false);

    const secondUser = createUser('user-2', true);

    const { getByTestId } = renderSession();

    await emitAuthState(firstUser);

    mockAuthState.currentUser = secondUser;

    fireEvent.press(getByTestId('sync-session'));

    expect(getByTestId('session-user').props.children).toBe('user-2');

    expect(getByTestId('email-verified').props.children).toBe('true');
  });

  it('waits for unauthenticated cleanup before marking session ready', async () => {
    const cleanup = createDeferred();

    const onUnauthenticated = jest.fn(() => cleanup.promise);

    const { getByTestId } = renderSession({
      onUnauthenticated,
    });

    act(() => {
      mockAuthStateListener?.(null);
    });

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);

    expect(getByTestId('session-ready').props.children).toBe('false');

    await act(async () => {
      cleanup.resolve();

      await cleanup.promise;
    });

    await waitFor(() => {
      expect(getByTestId('session-user').props.children).toBe('none');

      expect(getByTestId('session-ready').props.children).toBe('true');
    });
  });

  it('does not let stale unauthenticated cleanup overwrite a newer session', async () => {
    const cleanup = createDeferred();

    const onUnauthenticated = jest.fn(() => cleanup.promise);

    const firstUser = createUser('user-1', true);

    const secondUser = createUser('user-2', true);

    const { getByTestId } = renderSession({
      onUnauthenticated,
    });

    await emitAuthState(firstUser);

    act(() => {
      mockAuthState.currentUser = null;
      mockAuthStateListener?.(null);
    });

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);

    await emitAuthState(secondUser);

    expect(getByTestId('session-user').props.children).toBe('user-2');

    expect(getByTestId('session-ready').props.children).toBe('true');

    await act(async () => {
      cleanup.resolve();

      await cleanup.promise;
    });

    await waitFor(() => {
      expect(getByTestId('session-user').props.children).toBe('user-2');

      expect(getByTestId('email-verified').props.children).toBe('true');

      expect(getByTestId('session-ready').props.children).toBe('true');
    });
  });

  it('unsubscribes from Firebase auth state on unmount', () => {
    const { unmount } = renderSession();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
