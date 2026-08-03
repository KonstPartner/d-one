import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDiaryListStore } from '../../model/store';
import type { UpdateDiaryEntryData } from '../../model/types';
import { diaryQueryKeys } from '../constants';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { userId, repository } = useReadyDiaryDatabase();

  const resetListState = useDiaryListStore((state) => state.resetListState);

  return useMutation({
    mutationKey: [...diaryQueryKeys.localRoot(userId), 'update'],

    mutationFn: async (data: UpdateDiaryEntryData): Promise<string> => {
      await repository.update(data);

      return data.id;
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
