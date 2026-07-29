import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setEmailVerified(user?.emailVerified ?? false);
      setIsAuthReady(true);
    });

    return unsubscribe;
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
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
