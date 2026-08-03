import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDiaryListStore } from '../../model/store';
import type { UpdateDiaryEntryData } from '../../model/types';
import { diaryQueryKeys } from '../constants';
import {
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
} from '../diaryPhotoService';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

export type UpdateDiaryEntryPhotoChange =
  | { type: 'keep' }
  | { type: 'replace'; draftUri: string }
  | { type: 'delete' };

export type UpdateDiaryEntryMutationData = UpdateDiaryEntryData & {
  photoChange?: UpdateDiaryEntryPhotoChange;
};

const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { userId, repository } = useReadyDiaryDatabase();

  const resetListState = useDiaryListStore((state) => state.resetListState);

  return useMutation({
    mutationKey: [...diaryQueryKeys.localRoot(userId), 'update'],

    mutationFn: async ({
      photoChange = { type: 'keep' },
      ...data
    }: UpdateDiaryEntryMutationData): Promise<string> => {
      if (photoChange.type === 'keep') {
        await repository.update(data);

        return data.id;
      }

      const currentEntry = await repository.findById(data.id);

      if (currentEntry === null) {
        throw new Error(`Diary entry does not exist: ${data.id}`);
      }

      if (photoChange.type === 'delete') {
        const preparedRemoval = prepareDiaryPhotoRemoval({
          userId,
          entryId: data.id,
        });

        try {
          await repository.update({
            ...data,
            photo: {
              localPhotoUri: null,
              photoPath: currentEntry.photoPath,
              photoUrl: null,
            },
          });

          preparedRemoval.finalize();

          return data.id;
        } catch (error) {
          preparedRemoval.rollback();

          throw error;
        }
      }

      const preparedPhoto = prepareDiaryPhotoForEntry({
        userId,
        entryId: data.id,
        draftUri: photoChange.draftUri,
      });

      try {
        await repository.update({
          ...data,
          photo: {
            localPhotoUri: preparedPhoto.localPhotoUri,
            photoPath: preparedPhoto.photoPath,
            photoUrl: null,
          },
        });

        preparedPhoto.finalize();

        return data.id;
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
          console.error('Failed to refresh diary after entry update', error);
        });
    },

    networkMode: 'always',
    retry: false,
  });
};

export default useUpdateDiaryEntry;
