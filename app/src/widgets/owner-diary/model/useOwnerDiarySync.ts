import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncDiary } from '@features/sync-diary';
import { useReadyDiaryDatabase } from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import type { OwnerDiarySavedEntry } from './useOwnerDiaryEntryEditor';

export type OwnerDiaryPreparationState = OwnerDiarySavedEntry & {
  photoUri: string | null;
};

export const useOwnerDiarySync = () => {
  const { t } = useTranslation();

  const { repository } = useReadyDiaryDatabase();

  const sync = useSyncDiary();

  const [preparingSavedEntry, setPreparingSavedEntry] =
    useState<OwnerDiaryPreparationState | null>(null);

  const [manualSyncPending, setManualSyncPending] = useState(false);

  const [forcedSyncPending, setForcedSyncPending] = useState(false);

  const queueTargetedSync = useCallback(
    (entryId: string): void => {
      void sync.syncEntries([entryId]).catch((error) => {
        console.error(
          `Failed to synchronize saved diary entry: ${entryId}`,
          error
        );

        showNotification('error', t('diary.sync.failed'));
      });
    },
    [sync.syncEntries, t]
  );

  const handleEntrySaved = useCallback(
    async (savedEntry: OwnerDiarySavedEntry): Promise<void> => {
      if (sync.connectionState !== 'online') {
        return;
      }

      let entry;

      try {
        entry = await repository.findById(savedEntry.entryId);
      } catch (error) {
        console.error(
          `Failed to read saved diary entry: ${savedEntry.entryId}`,
          error
        );

        return;
      }

      if (entry === null) {
        return;
      }

      const photoNeedsUpload =
        entry.localPhotoUri !== null &&
        entry.photoPath !== null &&
        entry.photoUrl === null;

      if (!photoNeedsUpload) {
        queueTargetedSync(savedEntry.entryId);

        return;
      }

      setPreparingSavedEntry({
        ...savedEntry,

        photoUri: entry.localPhotoUri,
      });

      try {
        await sync.prepareEntryPhoto(savedEntry.entryId);
      } catch (error) {
        console.error(
          `Failed to upload diary photo: ${savedEntry.entryId}`,
          error
        );

        showNotification('error', t('diary.form.photo.errors.storageFailed'));

        return;
      } finally {
        setPreparingSavedEntry((current) =>
          current?.entryId === savedEntry.entryId ? null : current
        );
      }

      queueTargetedSync(savedEntry.entryId);
    },
    [
      queueTargetedSync,
      repository,

      sync.connectionState,
      sync.prepareEntryPhoto,

      t,
    ]
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

  const handleForcedSync = useCallback(
    async (entryIds: ReadonlyArray<string>): Promise<boolean> => {
      if (
        entryIds.length === 0 ||
        sync.connectionState !== 'online' ||
        sync.batchProgress !== null ||
        forcedSyncPending
      ) {
        return false;
      }

      setForcedSyncPending(true);

      try {
        await sync.syncForced(entryIds);

        return true;
      } catch (error) {
        console.error('Forced diary synchronization failed', error);

        showNotification('error', t('diary.sync.failed'));

        return false;
      } finally {
        setForcedSyncPending(false);
      }
    },
    [
      forcedSyncPending,

      sync.batchProgress,
      sync.connectionState,
      sync.syncForced,

      t,
    ]
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
    forcedSyncPending,

    preparingSavedEntry,

    isPreparingSavedEntry: preparingSavedEntry !== null,

    isEntrySyncing: sync.isEntrySyncing,

    handleEntrySaved,

    handleEntriesMarkedForDeletion,

    handleForcedSync,
    handleManualSync,
  };
};
