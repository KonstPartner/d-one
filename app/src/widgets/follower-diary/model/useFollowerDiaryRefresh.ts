import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  cloudDiaryPageQueryOptions,
  CloudDiaryRepository,
} from '@entities/diary';
import { getUserProfileFromServer, userProfileQueryKeys } from '@entities/user';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

type UseFollowerDiaryRefreshParams = {
  userId: string | null;

  currentOwnerUid: string | null;
};

export const useFollowerDiaryRefresh = ({
  userId,

  currentOwnerUid,
}: UseFollowerDiaryRefreshParams) => {
  const queryClient = useQueryClient();

  const refreshInProgressRef = useRef(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [contentRevision, setContentRevision] = useState(0);

  const fetchFirstPageFromServer = useCallback(
    async (ownerUid: string): Promise<void> => {
      const repository = new CloudDiaryRepository(ownerUid);

      await queryClient.fetchQuery({
        ...cloudDiaryPageQueryOptions({
          ownerUid,

          cursor: null,

          repository,
        }),

        staleTime: 0,
      });
    },
    [queryClient]
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (refreshInProgressRef.current) {
      return;
    }

    if (userId === null) {
      showNotification(
        'error',
        errorMapper(
          new Error('custom/no-user-is-currently-logged-in'),
          'firebase'
        )
      );

      return;
    }

    refreshInProgressRef.current = true;

    setIsRefreshing(true);

    try {
      let nextProfile;

      try {
        nextProfile = await getUserProfileFromServer(userId);
      } catch (error) {
        showNotification('error', errorMapper(error, 'firebase'));

        return;
      }

      queryClient.setQueryData(userProfileQueryKeys.byId(userId), nextProfile);

      const nextOwnerUids = nextProfile.followedUserIds ?? [];

      if (
        currentOwnerUid === null ||
        !nextOwnerUids.includes(currentOwnerUid)
      ) {
        setContentRevision((current) => current + 1);

        return;
      }

      try {
        await fetchFirstPageFromServer(currentOwnerUid);
      } catch (error) {
        showNotification('error', errorMapper(error, 'cloud'));

        return;
      }

      setContentRevision((current) => current + 1);
    } finally {
      refreshInProgressRef.current = false;

      setIsRefreshing(false);
    }
  }, [currentOwnerUid, fetchFirstPageFromServer, queryClient, userId]);

  return {
    refresh,

    isRefreshing,

    contentRevision,
  };
};
