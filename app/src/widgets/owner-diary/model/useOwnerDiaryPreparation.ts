import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  formatAnalyzeFoodResult,
  useAnalyzeFoodMutation,
} from '@features/analyze-diary-photo';
import { useSyncDiary } from '@features/sync-diary';
import {
  type DiaryEntry,
  diaryLocalQueryKeys,
  getDiaryEntryTimerDurationSeconds,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { normalizeAppLanguage } from '@shared/i18n';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';
import { startSystemTimer } from '@shared/lib/system-timer';

import type { OwnerDiarySavedEntry } from './useOwnerDiaryEntryEditor';

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

const hasPhotoToUpload = (entry: DiaryEntry): boolean =>
  entry.localPhotoUri !== null &&
  entry.photoPath !== null &&
  entry.photoUrl === null;

export const useOwnerDiaryPreparation = () => {
  const queryClient = useQueryClient();

  const { t, i18n } = useTranslation();

  const { userId, repository } = useReadyDiaryDatabase();

  const sync = useSyncDiary();

  const analyzeFood = useAnalyzeFoodMutation();

  const [preparingEntry, setPreparingEntry] =
    useState<OwnerDiaryPreparationState | null>(null);

  const refreshDiary = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: diaryLocalQueryKeys.pagesRoot(userId),
    });
  }, [queryClient, userId]);

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

  const saveAiAnalysis = useCallback(
    async (entryId: string, aiAnalysis: string): Promise<void> => {
      await repository.updateAiAnalysis({
        id: entryId,
        aiAnalysis,
      });

      await refreshDiary();
    },
    [refreshDiary, repository]
  );

  const handleEntrySaved = useCallback(
    async (savedEntry: OwnerDiarySavedEntry): Promise<void> => {
      let entry = await repository.findById(savedEntry.entryId);

      if (entry === null) {
        return;
      }

      let shouldSync = savedEntry.entryUpdated;

      if (savedEntry.deleteAiAnalysis && entry.aiAnalysis.length > 0) {
        await saveAiAnalysis(entry.id, '');

        shouldSync = true;

        entry = {
          ...entry,
          aiAnalysis: '',
        };
      }

      if (savedEntry.requestTimer) {
        const durationSeconds = getDiaryEntryTimerDurationSeconds(
          entry.eventAt
        );

        if (durationSeconds <= 0) {
          showNotification('error', t('diary.form.timer.errors.expired'));
        } else {
          try {
            await startSystemTimer({
              durationSeconds,
              message: t('diary.form.timer.systemLabel'),
            });

            showNotification('success', t('diary.form.timer.enabled'));
          } catch (error) {
            console.error(`Failed to create diary timer: ${entry.id}`, error);

            showNotification(
              'error',
              t('diary.form.timer.errors.createFailed')
            );
          }
        }
      }

      const photoNeedsUpload = hasPhotoToUpload(entry);

      const photoWillUpload =
        sync.connectionState === 'online' && photoNeedsUpload;

      const aiWillRun =
        sync.connectionState === 'online' && savedEntry.requestAi;

      if (!photoWillUpload && !aiWillRun) {
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
          try {
            const preparedEntry = await sync.prepareEntryPhoto(entry.id);

            if (preparedEntry === null) {
              return;
            }

            entry = preparedEntry;

            uploadedForAiOnly = aiOnlyUpdate;

            markPhotoUploaded(savedEntry.requestAi);
          } catch (error) {
            console.error(`Failed to upload diary photo: ${entry.id}`, error);

            showNotification(
              'error',
              t('diary.form.photo.errors.uploadFailed')
            );

            return;
          }
        }

        if (savedEntry.requestAi) {
          if (entry.photoPath === null || entry.photoUrl === null) {
            return;
          }

          setPhase('analyzingAi');

          try {
            const language = normalizeAppLanguage(
              i18n.resolvedLanguage ?? i18n.language
            );

            const result = await analyzeFood.mutateAsync({
              entryId: entry.id,

              photoPath: entry.photoPath,
              photoUrl: entry.photoUrl,

              comment: entry.comment,

              language,
            });

            if (result.status === 'not_food') {
              showNotification('warn', t('diaryAi.notFood'));
            } else if (result.status === 'insufficient_data') {
              showNotification('warn', t('diaryAi.insufficientData'));
            } else {
              const aiAnalysis = formatAnalyzeFoodResult(result, language);

              await saveAiAnalysis(entry.id, aiAnalysis);

              aiUpdated = true;
              shouldSync = true;

              setPhase('analysisReady', aiAnalysis);
            }
          } catch (error) {
            console.error(`Failed to analyze diary photo: ${entry.id}`, error);

            showNotification('error', errorMapper(error, 'api'));
          }
        }

        if (uploadedForAiOnly && !aiUpdated) {
          await repository.updatePendingPhotoState({
            id: entry.id,

            photoPath: entry.photoPath,

            photoUrl: null,
          });

          await refreshDiary();

          return;
        }

        if (shouldSync) {
          await syncEntry(entry.id);
        }
      } finally {
        sync.setEntryPreparing(entry.id, false);

        setPreparingEntry(null);
      }
    },
    [
      analyzeFood.mutateAsync,

      i18n.language,
      i18n.resolvedLanguage,

      markPhotoUploaded,
      refreshDiary,
      repository,
      saveAiAnalysis,
      setPhase,

      sync.connectionState,
      sync.prepareEntryPhoto,
      sync.setEntryPreparing,

      syncEntry,
      t,
    ]
  );

  return {
    preparingEntry,

    handleEntrySaved,
  };
};
