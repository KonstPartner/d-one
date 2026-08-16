import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { relatedUserProfileQueryOptions } from '@entities/user';

export type FollowerDiaryUser = {
  uid: string;
  nickname: string;
};

const useFollowerDiaryUsers = (followedUserIds: readonly string[]) => {
  const ownerUids = useMemo(
    () => Array.from(new Set(followedUserIds)),
    [followedUserIds]
  );

  const [selectedOwnerUidState, setSelectedOwnerUidState] = useState<
    string | null
  >(null);

  const selectedOwnerUid =
    selectedOwnerUidState !== null && ownerUids.includes(selectedOwnerUidState)
      ? selectedOwnerUidState
      : (ownerUids[0] ?? null);

  useEffect(() => {
    if (selectedOwnerUidState !== selectedOwnerUid) {
      setSelectedOwnerUidState(selectedOwnerUid);
    }
  }, [selectedOwnerUid, selectedOwnerUidState]);

  const selectorOwnerUids = ownerUids.length > 1 ? ownerUids : [];

  const profileQueries = useQueries({
    queries: selectorOwnerUids.map((uid) =>
      relatedUserProfileQueryOptions(uid)
    ),
  });

  const users = useMemo<FollowerDiaryUser[]>(
    () =>
      selectorOwnerUids.flatMap((uid, index) => {
        const profile = profileQueries[index]?.data;

        return profile === undefined
          ? []
          : [
              {
                uid,
                nickname: profile.nickname,
              },
            ];
      }),
    [profileQueries, selectorOwnerUids]
  );

  const failedQuery = profileQueries.find((query) => query.isError);

  const selectOwner = useCallback(
    (uid: string) => {
      if (ownerUids.includes(uid)) {
        setSelectedOwnerUidState(uid);
      }
    },
    [ownerUids]
  );

  return {
    ownerUid: selectedOwnerUid,

    users,
    showSelector: ownerUids.length > 1,

    selectorLoading:
      selectorOwnerUids.length > 0 &&
      profileQueries.some((query) => query.isPending),

    selectorError: failedQuery?.error ?? null,

    selectOwner,
  };
};

export default useFollowerDiaryUsers;
