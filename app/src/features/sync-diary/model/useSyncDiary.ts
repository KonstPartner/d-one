import { useCallback } from 'react';

import { useReadyDiaryDatabase } from '@entities/diary';

import { useSyncDiaryStore } from './syncDiaryStore';
import { useSyncDiaryCommands } from './useSyncDiaryCommands';
import { useSyncDiaryPhotoPreparation } from './useSyncDiaryPhotoPreparation';

export const useSyncDiary = () => {
  const { userId } = useReadyDiaryDatabase();

  const connectionState = useSyncDiaryStore((state) => state.connectionState);

  const batchProgress = useSyncDiaryStore((state) => state.batchProgress);

  const batchType = useSyncDiaryStore((state) => state.batchType);

  const syncingEntryIds = useSyncDiaryStore((state) => state.syncingEntryIds);

  const commands = useSyncDiaryCommands();

  const photo = useSyncDiaryPhotoPreparation({
    refreshLocalDiary: commands.refreshLocalDiary,
  });

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
    prepareEntryPhoto: photo.prepareEntryPhoto,

    syncEntries: commands.syncEntries,
    syncEntriesBatch: commands.syncEntriesBatch,
    syncForced: commands.syncForced,
    syncPending: commands.syncPending,

    isEntrySyncing,
  };
};
