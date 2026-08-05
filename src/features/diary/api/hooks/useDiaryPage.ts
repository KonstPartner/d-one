import { useQuery } from '@tanstack/react-query';

import type { DiaryFilters } from '../../model/types';
import { diaryApi } from '../diaryApi';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useDiaryPage = (page: number, filters: DiaryFilters) => {
  const { userId, repository } = useReadyDiaryDatabase();

  return useQuery(
    diaryApi.getLocalPageOptions({
      userId,
      page,
      filters,
      repository,
    })
  );
};

export default useDiaryPage;
