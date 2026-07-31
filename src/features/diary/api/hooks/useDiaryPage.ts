import { useQuery } from '@tanstack/react-query';

import { diaryApi } from '../diaryApi';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useDiaryPage = (page: number) => {
  const { userId, repository } = useReadyDiaryDatabase();

  return useQuery(
    diaryApi.getLocalPageOptions({
      userId,
      page,
      repository,
    })
  );
};

export default useDiaryPage;
