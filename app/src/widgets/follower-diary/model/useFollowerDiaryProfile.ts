import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@entities/session';
import {
  getUserProfileFromServer,
  type UserProfile,
  userProfileQueryKeys,
  userProfileQueryOptions,
} from '@entities/user';

export const useFollowerDiaryProfile = () => {
  const queryClient = useQueryClient();

  const { sessionUser, isSessionReady } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null,
  });

  const profile = profileQuery.data ?? null;

  const followedUserId = profile?.followedUserId ?? null;

  const refreshProfile = useCallback(async (): Promise<UserProfile> => {
    if (userId === null) {
      throw new Error('custom/no-user-is-currently-logged-in');
    }

    return queryClient.fetchQuery({
      queryKey: userProfileQueryKeys.byId(userId),

      queryFn: () => getUserProfileFromServer(userId),

      staleTime: 0,
    });
  }, [queryClient, userId]);

  return {
    userId,

    profile,
    followedUserId,

    refreshProfile,

    isInitialLoading: profile === null && profileQuery.isPending,

    hasInitialError: profile === null && profileQuery.isError,

    isRefreshing: profile !== null && profileQuery.isFetching,

    error: profileQuery.error,
  };
};
