import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from '../../api/firebase/config';
import { clearAuthSessionData } from '../utils/clearAuthSessionData';

type AuthContextValue = {
  authUser: User | null;
  emailVerified: boolean;
  isAuthReady: boolean;
  syncAuthUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const syncAuthUser = useCallback(() => {
    const user = auth.currentUser;

    setAuthUser(user);
    setEmailVerified(user?.emailVerified ?? false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(false);

      const applyAuthState = async () => {
        if (!user) {
          try {
            await clearAuthSessionData();
          } catch (error: unknown) {
            console.error('Failed to clear local auth session data:', error);
          }
        }

        if (!isMounted) {
          return;
        }

        setAuthUser(user);
        setEmailVerified(user?.emailVerified ?? false);
        setIsAuthReady(true);
      };

      void applyAuthState();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        emailVerified,
        isAuthReady,
        syncAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
