import { queryOptions } from '@tanstack/react-query';

import { FORCE_CACHE } from '@shared/api';

import { diaryLocalQueryKeys } from './diaryLocalQueryKeys';
import type { DiaryLocalRepository } from './DiaryLocalRepository';
import type { DiaryEntryQuery } from './diaryRepository.types';

type LocalDiaryPageQueryOptions = {
  userId: string;
  page: number;
  query: DiaryEntryQuery;
  repository: DiaryLocalRepository;
};

const getDiaryEntryQueryKey = (query: DiaryEntryQuery) => ({
  search: {
    field: query.search.field,
    query: query.search.query,
  },

  eventAt: {
    from: query.eventAt.from?.getTime() ?? null,

    to: query.eventAt.to?.getTime() ?? null,
  },

  glucose: {
    min: query.glucose.min,
    max: query.glucose.max,
  },

  shortInsulin: {
    min: query.shortInsulin.min,
    max: query.shortInsulin.max,
  },

  longInsulin: {
    min: query.longInsulin.min,
    max: query.longInsulin.max,
  },

  carbsGram: {
    min: query.carbsGram.min,
    max: query.carbsGram.max,
  },

  mealRelations: [...query.mealRelations],

  photo: query.photo,
  aiAnalysis: query.aiAnalysis,
});

export const diaryLocalPageQueryOptions = ({
  userId,
  page,
  query,
  repository,
}: LocalDiaryPageQueryOptions) =>
  queryOptions({
    queryKey: [
      ...diaryLocalQueryKeys.page({
        userId,
        page,
      }),
      getDiaryEntryQueryKey(query),
    ],

    queryFn: () => repository.findPage(page, query),

    networkMode: 'always',

    ...FORCE_CACHE,

    gcTime: Infinity,
    retry: false,
  });
