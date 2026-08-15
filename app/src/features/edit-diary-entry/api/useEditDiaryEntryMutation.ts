import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  diaryLocalQueryKeys,
  type DiaryRepositoryUpdateInput,
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
  runDiaryWriteOperation,
  useReadyDiaryDatabase,
} from '@entities/diary';

export type EditDiaryEntryPhotoChange =
  | {
      type: 'keep';
    }
  | {
      type: 'replace';
      draftUri: string;
    }
  | {
      type: 'delete';
    };

export type EditDiaryEntryMutationInput = Omit<
  DiaryRepositoryUpdateInput,
  'photo'
> & {
  photoChange?: EditDiaryEntryPhotoChange;
};

export const useEditDiaryEntryMutation = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  return useMutation({
    mutationKey: [...diaryLocalQueryKeys.root(userId), 'update'],

    mutationFn: async ({
      photoChange = {
        type: 'keep',
      },
      ...data
    }: EditDiaryEntryMutationInput): Promise<string> =>
      runDiaryWriteOperation(async () => {
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
      }),

    onSuccess: (entryId) => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.pagesRoot(userId),
        }),

        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.entry({
            userId,
            entryId,
          }),
        }),
      ]).catch((error) => {
        console.error('Failed to refresh diary after entry update', error);
      });
    },

    networkMode: 'always',
    retry: false,
  });
};
