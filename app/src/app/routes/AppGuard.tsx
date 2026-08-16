import { type ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/native';
import { useIsMutating, useQuery } from '@tanstack/react-query';
import { type Href, router, usePathname } from 'expo-router';

import { useDiaryTransferState } from '@entities/diary';
import { sessionMutationKeys, useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';
import { errorMapper } from '@shared/lib/errors';
import { isSamePath } from '@shared/routes';
import { ErrorSection, LoadingView, PageLayout } from '@shared/ui';

import { getGuardRedirectPath } from './access/getGuardRedirectPath';

type AppGuardProps = {
  children: ReactNode;
};

const isDiaryTransferRouteLocked = (
  phase: ReturnType<typeof useDiaryTransferState>['phase']
): boolean =>
  phase === 'waitingForSync' ||
  phase === 'validating' ||
  phase === 'resolvingConflicts' ||
  phase === 'processing';

export const AppGuard = ({ children }: AppGuardProps) => {
  const pathname = usePathname();

  const { sessionUser, emailVerified, isSessionReady } = useSession();

  const transfer = useDiaryTransferState();

  const transferLocked = isDiaryTransferRouteLocked(transfer.phase);

  const [isRedirecting, setIsRedirecting] = useState(false);

  const activeSessionMutations = useIsMutating({
    mutationKey: sessionMutationKeys.root,
  });

  const isSessionMutating = activeSessionMutations > 0;

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null && !isSessionMutating,
  });

  const hasSessionUser = sessionUser !== null;

  const isProfileLoading =
    !isSessionReady ||
    (hasSessionUser && (isSessionMutating || profileQuery.isPending));

  const isProfileError = hasSessionUser && profileQuery.isError;

  const profile = profileQuery.data ?? null;

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
    !transferLocked &&
    redirectPath !== null &&
    !isSamePath(redirectPath, pathname);

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

  if (isProfileError && !profileQuery.isFetching) {
    return (
      <PageLayout edges={['top']}>
        <GuardContainer>
          <HiddenContent>{children}</HiddenContent>

          <ErrorSection
            message={errorMapper(profileQuery.error, 'firebase')}
            onRetry={() => {
              void profileQuery.refetch();
            }}
          />
        </GuardContainer>
      </PageLayout>
    );
  }

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
