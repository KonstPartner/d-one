import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { diaryLocalQueryKeys, useReadyDiaryDatabase } from '@entities/diary';

import {
  queueDiaryEntriesForSync,
  queueForcedDiaryEntriesForSync,
  queuePendingDiaryEntriesForSync,
} from './syncDiaryCoordinator';

export const useSyncDiaryCommands = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const refreshLocalDiary = useCallback(async (): Promise<void> => {
    try {
      await queryClient.invalidateQueries({
        queryKey: diaryLocalQueryKeys.pagesRoot(userId),
      });
    } catch (error) {
      console.error('Failed to refresh diary after synchronization', error);
    }
  }, [queryClient, userId]);

  const syncEntries = useCallback(
    async (entryIds: ReadonlyArray<string>) => {
      try {
        return await queueDiaryEntriesForSync({
          userId,
          entryIds,
          repository,
        });
      } finally {
        await refreshLocalDiary();
      }
    },
    [refreshLocalDiary, repository, userId]
  );

  const syncForced = useCallback(
    async (entryIds: ReadonlyArray<string>) => {
      try {
        return await queueForcedDiaryEntriesForSync({
          userId,
          entryIds,
          repository,
        });
      } finally {
        await refreshLocalDiary();
      }
    },
    [refreshLocalDiary, repository, userId]
  );

  const syncPending = useCallback(async () => {
    try {
      return await queuePendingDiaryEntriesForSync({
        userId,
        repository,
        batchType: 'manual',
      });
    } finally {
      await refreshLocalDiary();
    }
  }, [refreshLocalDiary, repository, userId]);

  return {
    refreshLocalDiary,

    syncEntries,
    syncForced,
    syncPending,
  };
};
