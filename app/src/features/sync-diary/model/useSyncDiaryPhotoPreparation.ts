import { useCallback } from 'react';

import { type DiaryEntry, useReadyDiaryDatabase } from '@entities/diary';

type UseSyncDiaryPhotoPreparationParams = {
  refreshLocalDiary: () => Promise<void>;
};

export const useSyncDiaryPhotoPreparation = ({
  refreshLocalDiary,
}: UseSyncDiaryPhotoPreparationParams) => {
  const { repository } = useReadyDiaryDatabase();

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

  return {
    prepareEntryPhoto,
  };
};
