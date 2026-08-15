import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  diaryLocalQueryKeys,
  runDiaryWriteOperation,
  useReadyDiaryDatabase,
} from '@entities/diary';

export const useDeleteDiaryEntriesMutation = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  return useMutation({
    mutationKey: [...diaryLocalQueryKeys.root(userId), 'delete'],

    mutationFn: async (
      ids: ReadonlyArray<string>
    ): Promise<ReadonlyArray<string>> =>
      runDiaryWriteOperation(async () => {
        const entryIds = Array.from(new Set(ids));

        await repository.markPendingDelete(entryIds);

        return entryIds;
      }),

    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.pagesRoot(userId),
        }),

        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.entriesRoot(userId),
        }),
      ]).catch((error) => {
        console.error('Failed to refresh diary after entry deletion', error);
      });
    },

    networkMode: 'always',

    retry: false,
  });
};
