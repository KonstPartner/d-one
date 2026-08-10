import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncDiary } from '@features/sync-diary';
import { showNotification } from '@shared/lib/notifications';

import type { OwnerDiarySavedEntry } from './useOwnerDiaryEntryEditor';

export const useOwnerDiarySync = () => {
  const { t } = useTranslation();

  const sync = useSyncDiary();

  const [preparingSavedEntry, setPreparingSavedEntry] =
    useState<OwnerDiarySavedEntry | null>(null);

  const [manualSyncPending, setManualSyncPending] = useState(false);

  const handleEntrySaved = useCallback(
    async (savedEntry: OwnerDiarySavedEntry): Promise<void> => {
      if (sync.connectionState !== 'online') {
        return;
      }

      setPreparingSavedEntry(savedEntry);

      try {
        await sync.syncEntries([savedEntry.entryId]);
      } catch (error) {
        console.error(
          `Failed to synchronize saved diary entry: ${savedEntry.entryId}`,
          error
        );

        showNotification('error', t('diary.sync.failed'));
      } finally {
        setPreparingSavedEntry((current) =>
          current?.entryId === savedEntry.entryId ? null : current
        );
      }
    },
    [sync.connectionState, sync.syncEntries, t]
  );

  const handleEntriesMarkedForDeletion = useCallback(
    async (entryIds: ReadonlyArray<string>): Promise<boolean> => {
      if (entryIds.length === 0 || sync.connectionState !== 'online') {
        return false;
      }

      try {
        const results = await sync.syncEntries(entryIds);

        return results.some((result) => result.status === 'deleted');
      } catch (error) {
        console.error('Failed to synchronize deleted diary entries', error);

        showNotification('error', t('diary.sync.failed'));

        return false;
      }
    },
    [sync.connectionState, sync.syncEntries, t]
  );

  const handleManualSync = useCallback(async (): Promise<boolean> => {
    if (
      sync.connectionState !== 'online' ||
      sync.batchProgress !== null ||
      manualSyncPending
    ) {
      return false;
    }

    setManualSyncPending(true);

    try {
      await sync.syncPending();

      return true;
    } catch (error) {
      console.error('Manual diary synchronization failed', error);

      showNotification('error', t('diary.sync.failed'));

      return false;
    } finally {
      setManualSyncPending(false);
    }
  }, [
    manualSyncPending,
    sync.batchProgress,
    sync.connectionState,
    sync.syncPending,
    t,
  ]);

  return {
    connectionState: sync.connectionState,

    batchProgress: sync.batchProgress,

    batchType: sync.batchType,

    syncingEntryIds: sync.syncingEntryIds,

    manualSyncPending,

    preparingSavedEntry,

    isPreparingSavedEntry: preparingSavedEntry !== null,

    isEntrySyncing: sync.isEntrySyncing,

    handleEntrySaved,

    handleEntriesMarkedForDeletion,

    handleManualSync,
  };
};
