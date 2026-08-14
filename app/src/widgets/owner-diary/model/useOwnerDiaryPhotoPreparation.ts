import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useSyncDiary } from '@features/sync-diary';
import {
  type DiaryEntry,
  diaryLocalQueryKeys,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

export const useOwnerDiaryPhotoPreparation = () => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { userId, repository } = useReadyDiaryDatabase();

  const sync = useSyncDiary();

  const refreshDiary = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: diaryLocalQueryKeys.pagesRoot(userId),
    });
  }, [queryClient, userId]);

  const needsUpload = useCallback(
    (entry: DiaryEntry): boolean =>
      entry.localPhotoUri !== null &&
      entry.photoPath !== null &&
      entry.photoUrl === null,
    []
  );

  const upload = useCallback(
    async (entry: DiaryEntry): Promise<DiaryEntry | null> => {
      if (!needsUpload(entry)) {
        return entry;
      }

      try {
        return await sync.prepareEntryPhoto(entry.id);
      } catch (error) {
        console.error(`Failed to upload diary photo: ${entry.id}`, error);

        showNotification('error', t('diary.form.photo.errors.uploadFailed'));

        return null;
      }
    },
    [needsUpload, sync.prepareEntryPhoto, t]
  );

  const restorePendingState = useCallback(
    async (entry: DiaryEntry): Promise<void> => {
      await repository.updatePendingPhotoState({
        id: entry.id,

        photoPath: entry.photoPath,

        photoUrl: null,
      });

      await refreshDiary();
    },
    [refreshDiary, repository]
  );

  return {
    needsUpload,
    upload,
    restorePendingState,
  };
};
