import { useQuery } from '@tanstack/react-query';

import {
  createDefaultDiaryEntryQuery,
  diaryLocalQueryKeys,
  useReadyDiaryDatabase,
} from '@entities/diary';

export type DiaryExportScopeStats = {
  entriesCount: number;
  localPhotosCount: number;
};

type DiaryExportPeriod = {
  from: Date;
  to: Date;
};

const getPeriodTimestamp = (value: Date | null): number | null => {
  if (value === null) {
    return null;
  }

  const timestamp = value.getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

export const useDiaryExportAllStats = () => {
  const { userId, repository } = useReadyDiaryDatabase();

  const query = useQuery({
    queryKey: [
      ...diaryLocalQueryKeys.root(userId),
      'export-scope-stats',
      'all',
    ],

    queryFn: () => repository.countBackupEntries(),

    enabled: false,

    networkMode: 'always',

    staleTime: 0,
  });

  return {
    stats: query.data ?? null,

    isFetching: query.isFetching,

    error: query.error,

    refresh: query.refetch,
  };
};

export const useDiaryExportPeriodStats = (period: DiaryExportPeriod | null) => {
  const { userId, repository } = useReadyDiaryDatabase();

  const fromTimestamp = getPeriodTimestamp(period?.from ?? null);

  const toTimestamp = getPeriodTimestamp(period?.to ?? null);

  const validPeriod =
    period !== null &&
    fromTimestamp !== null &&
    toTimestamp !== null &&
    fromTimestamp <= toTimestamp;

  const query = useQuery({
    queryKey: [
      ...diaryLocalQueryKeys.root(userId),
      'export-scope-stats',
      'period',
      fromTimestamp,
      toTimestamp,
    ],

    queryFn: () => {
      if (period === null || !validPeriod) {
        return Promise.reject(new Error('Invalid diary export period'));
      }

      const diaryQuery = createDefaultDiaryEntryQuery();

      diaryQuery.eventAt = {
        from: period.from,
        to: period.to,
      };

      return repository.countBackupEntries(diaryQuery);
    },

    enabled: validPeriod,

    networkMode: 'always',

    staleTime: 0,
  });

  return {
    stats: validPeriod ? (query.data ?? null) : null,

    isFetching: validPeriod && query.isFetching,

    error: validPeriod ? query.error : null,
  };
};
