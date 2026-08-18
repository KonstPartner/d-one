import { useQuery } from '@tanstack/react-query';

import { useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';

const EMPTY_FOLLOWED_USER_IDS: readonly string[] = [];

export const useFollowerDiaryProfile = () => {
  const { sessionUser, isSessionReady } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null,
  });

  const profile = profileQuery.data ?? null;

  const followedUserIds = profile?.followedUserIds ?? EMPTY_FOLLOWED_USER_IDS;

  return {
    userId,

    profile,
    followedUserIds,

    isInitialLoading: profile === null && profileQuery.isPending,

    hasInitialError: profile === null && profileQuery.isError,

    error: profileQuery.error,
  };
};
