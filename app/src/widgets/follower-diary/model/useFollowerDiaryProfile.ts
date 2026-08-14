import { useQuery } from '@tanstack/react-query';

import { useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';

export const useFollowerDiaryProfile = () => {
  const { sessionUser, isSessionReady } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null,
  });

  const profile = profileQuery.data ?? null;

  const followedUserId = profile?.followedUserId ?? null;

  return {
    userId,

    profile,
    followedUserId,

    isInitialLoading: profile === null && profileQuery.isPending,

    hasInitialError: profile === null && profileQuery.isError,

    error: profileQuery.error,
  };
};
