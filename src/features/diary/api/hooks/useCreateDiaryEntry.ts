import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc } from 'firebase/firestore';

import { db } from '@features/auth/api/firebase/config';

import { useDiaryListStore } from '../../model/store';
import type { CreateDiaryEntryData } from '../../model/types';
import { diaryQueryKeys } from '../constants';
import { prepareDiaryPhotoForEntry } from '../diaryPhotoService';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

export type CreateDiaryEntryMutationData = CreateDiaryEntryData & {
  photoDraftUri?: string | null;
};

const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { userId, repository } = useReadyDiaryDatabase();

  const resetListState = useDiaryListStore((state) => state.resetListState);

  return useMutation({
    mutationKey: [...diaryQueryKeys.localRoot(userId), 'create'],

    mutationFn: async ({
      photoDraftUri = null,
      ...data
    }: CreateDiaryEntryMutationData): Promise<string> => {
      const entryId = doc(collection(db, 'users', userId, 'diaryEntries')).id;

      if (photoDraftUri === null) {
        await repository.create({
          ...data,
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
          ...data,
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
      resetListState();

      void queryClient
        .invalidateQueries({
          queryKey: diaryQueryKeys.localPagesRoot(userId),
        })
        .catch((error) => {
          console.error('Failed to refresh diary after entry creation', error);
        });
    },

    networkMode: 'always',
    retry: false,
  });
};

export default useCreateDiaryEntry;
