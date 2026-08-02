import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc } from 'firebase/firestore';

import { db } from '@features/auth/api/firebase/config';

import { useDiaryListStore } from '../../model/store';
import type { CreateDiaryEntryData } from '../../model/types';
import { diaryQueryKeys } from '../constants';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { userId, repository } = useReadyDiaryDatabase();

  const resetListState = useDiaryListStore((state) => state.resetListState);

  return useMutation({
    mutationKey: [...diaryQueryKeys.localRoot(userId), 'create'],

    mutationFn: async (data: CreateDiaryEntryData): Promise<string> => {
      const entryId = doc(collection(db, 'users', userId, 'diaryEntries')).id;

      await repository.create({
        ...data,
        id: entryId,
        localPhotoUri: null,
        photoPath: null,
      });

      return entryId;
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
