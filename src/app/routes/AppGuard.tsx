import { type ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/native';
import { type Href, router, usePathname } from 'expo-router';

import useAuthData from '@features/auth/api/hooks/useAuthData';
import { useSession } from '@entities/session';
import { LoadingView } from '@entities/shared/ui';
import { isSamePath } from '@shared/routes';

import { getGuardRedirectPath } from './model/getGuardRedirectPath';

type AppGuardProps = {
  children: ReactNode;
};

export const AppGuard = ({ children }: AppGuardProps) => {
  const pathname = usePathname();

  const { sessionUser, emailVerified } = useSession();

  const { authData, isAuthLoading, isError: isAuthDataError } = useAuthData();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasSessionUser = sessionUser !== null;

  const canResolveRoute =
    !isAuthLoading &&
    !isAuthDataError &&
    (!hasSessionUser || Boolean(authData));

  const redirectPath = canResolveRoute
    ? getGuardRedirectPath({
        pathname,
        hasSessionUser,
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
      <GuardContainer>
        <HiddenContent>{children}</HiddenContent>

        <LoadingView loading />
      </GuardContainer>
    );
  }

  if (isAuthDataError) {
    return (
      <GuardContainer>
        <LoadingView loading />
      </GuardContainer>
    );
  }

  if (redirectPath && !isSamePath(redirectPath, pathname)) {
    return (
      <GuardContainer>
        <HiddenContent>{children}</HiddenContent>

        <LoadingView loading />
      </GuardContainer>
    );
  }

  return <>{children}</>;
};

const GuardContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const HiddenContent = styled.View`
  display: none;
`;
