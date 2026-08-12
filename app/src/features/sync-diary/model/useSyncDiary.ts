import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  type DiaryEntry,
  diaryLocalQueryKeys,
  useReadyDiaryDatabase,
} from '@entities/diary';

import {
  queueDiaryEntriesForSync,
  queueForcedDiaryEntriesForSync,
  queuePendingDiaryEntriesForSync,
} from './syncDiaryCoordinator';
import { useSyncDiaryStore } from './syncDiaryStore';

export const useSyncDiary = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const connectionState = useSyncDiaryStore((state) => state.connectionState);

  const batchProgress = useSyncDiaryStore((state) => state.batchProgress);

  const batchType = useSyncDiaryStore((state) => state.batchType);

  const syncingEntryIds = useSyncDiaryStore((state) => state.syncingEntryIds);

  const refreshLocalDiary = useCallback(async (): Promise<void> => {
    try {
      await queryClient.invalidateQueries({
        queryKey: diaryLocalQueryKeys.pagesRoot(userId),
      });
    } catch (error) {
      console.error('Failed to refresh diary after synchronization', error);
    }
  }, [queryClient, userId]);

  const setEntryPreparing = useCallback(
    (entryId: string, active: boolean): void => {
      useSyncDiaryStore.getState().setEntryPreparing({
        userId,
        entryId,
        active,
      });
    },
    [userId]
  );

  const prepareEntryPhoto = useCallback(
    async (entryId: string): Promise<DiaryEntry | null> => {
      const entry = await repository.findById(entryId);

      if (entry === null) {
        return null;
      }

      if (entry.localPhotoUri === null) {
        return entry;
      }

      if (entry.photoPath === null) {
        throw new Error(
          `Diary entry photo does not have a Storage path: ${entryId}`
        );
      }

      if (entry.photoUrl !== null) {
        return entry;
      }

      const { uploadDiaryCloudPhoto } =
        await import('../api/diaryFirebaseSyncGateway');

      const photoUrl = await uploadDiaryCloudPhoto({
        localPhotoUri: entry.localPhotoUri,

        photoPath: entry.photoPath,
      });

      await repository.updatePendingPhotoState({
        id: entry.id,

        photoPath: entry.photoPath,

        photoUrl,
      });

      await refreshLocalDiary();

      return {
        ...entry,

        photoUrl,
      };
    },
    [refreshLocalDiary, repository]
  );

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

  const isEntrySyncing = useCallback(
    (entryId: string): boolean => syncingEntryIds.has(entryId),
    [syncingEntryIds]
  );

  return {
    connectionState,

    batchProgress,
    batchType,

    syncingEntryIds,

    setEntryPreparing,
    prepareEntryPhoto,

    syncEntries,
    syncForced,
    syncPending,

    isEntrySyncing,
  };
};
