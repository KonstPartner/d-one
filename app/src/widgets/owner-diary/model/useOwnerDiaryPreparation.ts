import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncDiary } from '@features/sync-diary';
import {
  tryAcquireDiaryWriteOperation,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiaryAiPreparation } from './useOwnerDiaryAiPreparation';
import type { OwnerDiarySavedEntry } from './useOwnerDiaryEntryEditor';
import { useOwnerDiaryPhotoPreparation } from './useOwnerDiaryPhotoPreparation';
import { useOwnerDiaryTimer } from './useOwnerDiaryTimer';

export type OwnerDiaryPreparationPhase =
  | 'uploadingPhoto'
  | 'photoUploaded'
  | 'analyzingAi'
  | 'analysisReady';

export type OwnerDiaryPreparationState = OwnerDiarySavedEntry & {
  photoUri: string | null;

  photoStepVisible: boolean;
  photoUploaded: boolean;

  phase: OwnerDiaryPreparationPhase;

  aiAnalysis: string | null;
};

export const useOwnerDiaryPreparation = () => {
  const { t } = useTranslation();

  const { repository } = useReadyDiaryDatabase();

  const sync = useSyncDiary();

  const timer = useOwnerDiaryTimer();

  const photo = useOwnerDiaryPhotoPreparation();

  const ai = useOwnerDiaryAiPreparation();

  const [preparingEntry, setPreparingEntry] =
    useState<OwnerDiaryPreparationState | null>(null);

  const setPhase = useCallback(
    (
      phase: OwnerDiaryPreparationPhase,
      aiAnalysis: string | null = null
    ): void => {
      setPreparingEntry((current) =>
        current === null
          ? null
          : {
              ...current,
              phase,
              aiAnalysis,
            }
      );
    },
    []
  );

  const markPhotoUploaded = useCallback((showAiStep: boolean): void => {
    setPreparingEntry((current) =>
      current === null
        ? null
        : {
            ...current,
            photoUploaded: true,
            phase: showAiStep ? 'analyzingAi' : 'photoUploaded',
          }
    );
  }, []);

  const syncEntry = useCallback(
    async (entryId: string): Promise<void> => {
      try {
        await sync.syncEntries([entryId]);
      } catch (error) {
        console.error(`Failed to synchronize diary entry: ${entryId}`, error);

        showNotification('error', t('diary.sync.failed'));
      }
    },
    [sync.syncEntries, t]
  );

  const handleEntrySaved = useCallback(
    async (savedEntry: OwnerDiarySavedEntry): Promise<void> => {
      const preparationOperation = tryAcquireDiaryWriteOperation();

      if (preparationOperation === null) {
        return;
      }

      let preparationReleased = false;

      const releasePreparation = (): void => {
        if (preparationReleased) {
          return;
        }

        preparationReleased = true;
        preparationOperation.release();
      };

      try {
        let entry = await repository.findById(savedEntry.entryId);

        if (entry === null) {
          return;
        }

        let shouldSync = savedEntry.entryUpdated;

        if (savedEntry.deleteAiAnalysis && entry.aiAnalysis.length > 0) {
          await ai.deleteAnalysis(entry.id);

          shouldSync = true;

          entry = {
            ...entry,
            aiAnalysis: '',
          };
        }

        if (savedEntry.requestTimer) {
          await timer.setTimerForEntry(entry);
        }

        const photoNeedsUpload = photo.needsUpload(entry);

        const photoWillUpload =
          sync.connectionState === 'online' && photoNeedsUpload;

        const aiWillRun =
          sync.connectionState === 'online' && savedEntry.requestAi;

        if (!photoWillUpload && !aiWillRun) {
          releasePreparation();

          if (sync.connectionState === 'online' && shouldSync) {
            await syncEntry(entry.id);
          }

          return;
        }

        setPreparingEntry({
          ...savedEntry,

          photoUri: entry.localPhotoUri ?? entry.photoUrl,

          photoStepVisible: photoWillUpload,
          photoUploaded: false,

          phase: photoWillUpload ? 'uploadingPhoto' : 'analyzingAi',

          aiAnalysis: null,
        });

        sync.setEntryPreparing(entry.id, true);

        const aiOnlyUpdate =
          savedEntry.operation === 'update' &&
          !savedEntry.entryUpdated &&
          !savedEntry.deleteAiAnalysis &&
          savedEntry.requestAi;

        let uploadedForAiOnly = false;
        let aiUpdated = false;

        try {
          if (photoNeedsUpload) {
            const preparedEntry = await photo.upload(entry);

            if (preparedEntry === null) {
              return;
            }

            entry = preparedEntry;

            uploadedForAiOnly = aiOnlyUpdate;

            markPhotoUploaded(savedEntry.requestAi);
          }

          if (savedEntry.requestAi) {
            if (entry.photoPath === null || entry.photoUrl === null) {
              return;
            }

            setPhase('analyzingAi');

            const aiAnalysis = await ai.analyzeEntry(entry);

            if (aiAnalysis !== null) {
              aiUpdated = true;
              shouldSync = true;

              setPhase('analysisReady', aiAnalysis);
            }
          }

          if (uploadedForAiOnly && !aiUpdated) {
            await photo.restorePendingState(entry);

            return;
          }

          releasePreparation();

          if (shouldSync) {
            await syncEntry(entry.id);
          }
        } finally {
          sync.setEntryPreparing(entry.id, false);

          setPreparingEntry(null);
        }
      } finally {
        releasePreparation();
      }
    },
    [
      ai.analyzeEntry,
      ai.deleteAnalysis,

      markPhotoUploaded,
      photo.needsUpload,
      photo.restorePendingState,
      photo.upload,
      repository,
      setPhase,

      sync.connectionState,
      sync.setEntryPreparing,

      syncEntry,

      timer.setTimerForEntry,
    ]
  );

  return {
    preparingEntry,

    handleEntrySaved,
  };
};
