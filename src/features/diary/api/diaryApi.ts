import { queryOptions } from '@tanstack/react-query';

import { FORCE_CACHE } from '@features/shared/api';

import type { DiaryFilters } from '../model/types';
import { normalizeDiaryFilters } from '../model/types';

import { diaryQueryKeys } from './constants';
import type { DiaryRepository } from './sqlite/diaryRepository';

type LocalDiaryPageOptions = {
  userId: string;
  page: number;
  filters: DiaryFilters;
  repository: DiaryRepository;
};

const getLocalPageFiltersKey = (filters: DiaryFilters) => ({
  search: filters.search,
  date: {
    from: filters.date.from,
    to: filters.date.to,
  },
  glucose: filters.glucose,
  shortInsulin: filters.shortInsulin,
  longInsulin: filters.longInsulin,
  carbsGram: filters.carbsGram,
  mealRelations: filters.mealRelations,
  photo: filters.photo,
  aiAnalysis: filters.aiAnalysis,
});

export const diaryApi = {
  baseKey: 'diary',

  getLocalPageOptions: ({
    userId,
    page,
    filters,
    repository,
  }: LocalDiaryPageOptions) => {
    const normalizedFilters = normalizeDiaryFilters(filters);

    return queryOptions({
      queryKey: [
        ...diaryQueryKeys.localPage({
          userId,
          page,
        }),
        getLocalPageFiltersKey(normalizedFilters),
      ],

      queryFn: () => repository.findPage(page, normalizedFilters),

      networkMode: 'always',

      ...FORCE_CACHE,

      gcTime: Infinity,
      retry: false,
    });
  },
};
