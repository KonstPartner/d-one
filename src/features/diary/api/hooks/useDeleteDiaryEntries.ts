import { useMutation, useQueryClient } from '@tanstack/react-query';

import { diaryQueryKeys } from '../constants';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useDeleteDiaryEntries = () => {
  const queryClient = useQueryClient();
  const { userId, repository } = useReadyDiaryDatabase();

  return useMutation({
    mutationKey: [...diaryQueryKeys.localRoot(userId), 'delete'],

    mutationFn: async (ids: ReadonlyArray<string>): Promise<string[]> => {
      await repository.markPendingDelete(ids);

      return Array.from(new Set(ids));
    },

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: diaryQueryKeys.localPagesRoot(userId),
      }),

    networkMode: 'always',
    retry: false,
  });
};

export default useDeleteDiaryEntries;
