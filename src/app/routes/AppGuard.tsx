import { type ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/native';
import { type Href, router, usePathname } from 'expo-router';

import { useCurrentUserProfile } from '@features/auth/model';
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

  const {
    profile,
    isProfileLoading,
    isError: isProfileError,
  } = useCurrentUserProfile();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasSessionUser = sessionUser !== null;

  const canResolveRoute =
    !isProfileLoading &&
    !isProfileError &&
    (!hasSessionUser || profile !== null);

  const redirectPath = canResolveRoute
    ? getGuardRedirectPath({
        pathname,
        hasSessionUser,
        emailVerified,
        role: profile?.role ?? null,
      })
    : null;

  const isRedirectRequired =
    redirectPath !== null && !isSamePath(redirectPath, pathname);

  useEffect(() => {
    if (!isRedirectRequired) {
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
  }, [isRedirectRequired, redirectPath]);

  if (
    isProfileLoading ||
    isProfileError ||
    isRedirecting ||
    !canResolveRoute ||
    isRedirectRequired
  ) {
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
