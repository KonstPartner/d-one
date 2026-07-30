import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Href, router, usePathname } from 'expo-router';

import { LoadingView } from '@entities/shared/ui';
import useAuthData from '@features/auth/api/hooks/useAuthData';
import { useAuth } from '@features/auth/model/context/AuthContext';
import { getGuardRedirectPath, isSamePath } from '@features/layout/model';

const AppGuard = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const theme = useTheme();

  const { authUser, emailVerified } = useAuth();

  const { authData, isAuthLoading, isError: isAuthDataError } = useAuthData();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasAuthUser = Boolean(authUser);

  const canResolveRoute =
    !isAuthLoading && !isAuthDataError && (!hasAuthUser || Boolean(authData));

  const redirectPath = canResolveRoute
    ? getGuardRedirectPath({
        pathname,
        hasAuthUser,
        emailVerified,
        authRole: authData?.role ?? null,
      })
    : null;

  useEffect(() => {
    if (!redirectPath || isSamePath(redirectPath, pathname)) {
      setIsRedirecting(false);

      return;
    }

    setIsRedirecting(true);

    const frame = requestAnimationFrame(() => {
      router.replace(redirectPath as Href);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, redirectPath]);

  if (isAuthLoading || isRedirecting) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
        }}
      >
        <View style={{ display: 'none' }}>{children}</View>

        <LoadingView loading />
      </View>
    );
  }

  if (isAuthDataError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
        }}
      >
        <LoadingView loading />
      </View>
    );
  }

  if (redirectPath && !isSamePath(redirectPath, pathname)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
        }}
      >
        <View style={{ display: 'none' }}>{children}</View>

        <LoadingView loading />
      </View>
    );
  }

  return <>{children}</>;
};

export default AppGuard;
