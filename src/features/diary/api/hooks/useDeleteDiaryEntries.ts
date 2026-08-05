import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDiaryListStore } from '../../model/store';
import { diaryQueryKeys } from '../constants';
import { queueDiaryEntriesForSync } from '../diarySyncCoordinator';
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

    onSuccess: (entryIds) => {
      void queryClient.invalidateQueries({
        queryKey: diaryQueryKeys.localPagesRoot(userId),
      });

      void queueDiaryEntriesForSync({
        userId,
        entryIds,
        repository,
      })
        .then(async (results) => {
          if (!results.some((result) => result.status === 'deleted')) {
            return;
          }

          const { currentPage, appliedFilters } = useDiaryListStore.getState();
          const page = await repository.findPage(currentPage, appliedFilters);
          const lastPage = Math.max(page.pagination.totalPages, 1);

          if (currentPage > lastPage) {
            useDiaryListStore.getState().setCurrentPage(lastPage);
          }

          await queryClient.invalidateQueries({
            queryKey: diaryQueryKeys.localPagesRoot(userId),
          });
        })
        .catch((error) => {
          console.error('Failed to refresh diary after synchronization', error);
        });
    },

    networkMode: 'always',
    retry: false,
  });
};

export default useDeleteDiaryEntries;
