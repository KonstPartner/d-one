import { queryOptions } from '@tanstack/react-query';

import { FORCE_CACHE } from '@features/shared/api';

import { diaryQueryKeys } from './constants';
import type { DiaryRepository } from './sqlite/diaryRepository';

type LocalDiaryPageOptions = {
  userId: string;
  page: number;
  repository: DiaryRepository;
};

export const diaryApi = {
  baseKey: 'diary',

  getLocalPageOptions: ({ userId, page, repository }: LocalDiaryPageOptions) =>
    queryOptions({
      queryKey: diaryQueryKeys.localPage({
        userId,
        page,
      }),

      queryFn: () => repository.findPage(page),

      networkMode: 'always',

      ...FORCE_CACHE,

      gcTime: Infinity,
      retry: false,
    }),
};
