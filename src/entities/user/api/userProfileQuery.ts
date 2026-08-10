import { queryOptions } from '@tanstack/react-query';

import { getUserProfile } from './getUserProfile';

const USER_PROFILE_QUERY_ROOT = ['user-profile'] as const;

export const userProfileQueryKeys = {
  root: USER_PROFILE_QUERY_ROOT,

  byId: (uid: string) => [...USER_PROFILE_QUERY_ROOT, uid] as const,
};

export const userProfileQueryOptions = (uid: string | null) =>
  queryOptions({
    queryKey:
      uid === null ? userProfileQueryKeys.root : userProfileQueryKeys.byId(uid),

    queryFn: () => {
      if (uid === null) {
        throw new Error('custom/no-user-is-currently-logged-in');
      }

      return getUserProfile(uid);
    },

    enabled: uid !== null,

    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
