import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc } from 'firebase/firestore';

import type { DiaryEntryEditableValues } from '@entities/diary';
import {
  diaryLocalQueryKeys,
  prepareDiaryPhotoForEntry,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { db } from '@shared/api';

export type CreateDiaryEntryMutationInput = DiaryEntryEditableValues & {
  photoDraftUri?: string | null;
};

export const useCreateDiaryEntryMutation = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  return useMutation({
    mutationKey: [...diaryLocalQueryKeys.root(userId), 'create'],

    mutationFn: async ({
      photoDraftUri = null,
      ...values
    }: CreateDiaryEntryMutationInput): Promise<string> => {
      const entryId = doc(collection(db, 'users', userId, 'diaryEntries')).id;

      if (photoDraftUri === null) {
        await repository.create({
          ...values,
          id: entryId,
          localPhotoUri: null,
          photoPath: null,
        });

        return entryId;
      }

      const preparedPhoto = prepareDiaryPhotoForEntry({
        userId,
        entryId,
        draftUri: photoDraftUri,
      });

      try {
        await repository.create({
          ...values,
          id: entryId,
          localPhotoUri: preparedPhoto.localPhotoUri,
          photoPath: preparedPhoto.photoPath,
        });

        preparedPhoto.finalize();

        return entryId;
      } catch (error) {
        preparedPhoto.rollback();

        throw error;
      }
    },

    onSuccess: () => {
      void queryClient
        .invalidateQueries({
          queryKey: diaryLocalQueryKeys.pagesRoot(userId),
        })
        .catch((error) => {
          console.error('Failed to refresh diary after entry creation', error);
        });
    },

    networkMode: 'always',
    retry: false,
  });
};
