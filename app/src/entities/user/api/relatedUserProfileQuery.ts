import { queryOptions } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@shared/api';

import { isUserProfile } from '../model/isUserProfile';
import type { UserProfile } from '../model/types';

export const getRelatedUserProfile = async (
  uid: string
): Promise<UserProfile> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-not-found');
  }

  const profile: unknown = snapshot.data();

  if (!isUserProfile(profile) || profile.uid !== uid) {
    throw new Error('custom/invalid-user-profile');
  }

  return profile;
};

const RELATED_USER_PROFILE_QUERY_ROOT = ['related-user-profile'] as const;

export const relatedUserProfileQueryKeys = {
  root: RELATED_USER_PROFILE_QUERY_ROOT,

  byId: (uid: string) => [...RELATED_USER_PROFILE_QUERY_ROOT, uid] as const,
};

export const relatedUserProfileQueryOptions = (uid: string) =>
  queryOptions({
    queryKey: relatedUserProfileQueryKeys.byId(uid),

    queryFn: () => getRelatedUserProfile(uid),

    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
