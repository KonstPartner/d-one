import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from '@shared/api';

type SessionContextValue = {
  sessionUser: User | null;
  emailVerified: boolean;
  isSessionReady: boolean;
  syncSessionUser: () => void;
};

type SessionProviderProps = PropsWithChildren<{
  onUnauthenticated?: () => Promise<void> | void;
}>;

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({
  children,
  onUnauthenticated,
}: SessionProviderProps) => {
  const [sessionUser, setSessionUser] = useState<User | null>(null);

  const [emailVerified, setEmailVerified] = useState(false);

  const [isSessionReady, setIsSessionReady] = useState(false);

  const syncSessionUser = useCallback(() => {
    const currentUser = auth.currentUser;

    setSessionUser(currentUser);
    setEmailVerified(currentUser?.emailVerified ?? false);
  }, []);

  useEffect(() => {
    let mounted = true;
    let revision = 0;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      const currentRevision = ++revision;

      setIsSessionReady(false);

      const applySession = async () => {
        if (!nextUser) {
          try {
            await onUnauthenticated?.();
          } catch (error: unknown) {
            console.error(
              'Failed to clear unauthenticated session data',
              error
            );
          }
        }

        if (!mounted || currentRevision !== revision) {
          return;
        }

        setSessionUser(nextUser);
        setEmailVerified(nextUser?.emailVerified ?? false);
        setIsSessionReady(true);
      };

      void applySession();
    });

    return () => {
      mounted = false;
      revision += 1;
      unsubscribe();
    };
  }, [onUnauthenticated]);

  return (
    <SessionContext.Provider
      value={{
        sessionUser,
        emailVerified,
        isSessionReady,
        syncSessionUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
};
