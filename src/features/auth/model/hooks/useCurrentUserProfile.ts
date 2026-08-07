import { useIsMutating, useQuery } from '@tanstack/react-query';

import { useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';

import { authMutationKeys } from '../../api/authMutationKeys';

export const useCurrentUserProfile = () => {
  const { sessionUser, isSessionReady } = useSession();

  const isAuthMutating =
    useIsMutating({
      mutationKey: authMutationKeys.root,
    }) > 0;

  const userId = sessionUser?.uid ?? null;

  const query = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null && !isAuthMutating,
  });

  const isProfileLoading =
    !isSessionReady || (userId !== null && (isAuthMutating || query.isPending));

  return {
    ...query,

    profile: query.data ?? null,
    isProfileLoading,
    isAuthMutating,
  };
};
