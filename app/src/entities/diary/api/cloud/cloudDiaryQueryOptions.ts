import { queryOptions } from '@tanstack/react-query';

import { FORCE_CACHE } from '@shared/api';

import type { CloudDiaryCursor } from '../../model/cloudDiaryPage';

import type { CloudDiaryRepository } from './CloudDiaryRepository';

type CloudDiaryPageQueryOptionsParams = {
  ownerUid: string;
  cursor: CloudDiaryCursor | null;
  repository: CloudDiaryRepository;
};

const cloudDiaryQueryKeys = {
  all: ['cloudDiary'] as const,

  owner: (ownerUid: string) => [...cloudDiaryQueryKeys.all, ownerUid] as const,

  page: ({
    ownerUid,
    cursor,
  }: {
    ownerUid: string;
    cursor: CloudDiaryCursor | null;
  }) =>
    [
      ...cloudDiaryQueryKeys.owner(ownerUid),
      'page',
      cursor?.eventAtMs ?? null,
      cursor?.id ?? null,
    ] as const,
};

export const cloudDiaryPageQueryOptions = ({
  ownerUid,
  cursor,
  repository,
}: CloudDiaryPageQueryOptionsParams) =>
  queryOptions({
    queryKey: cloudDiaryQueryKeys.page({
      ownerUid,
      cursor,
    }),

    queryFn: () => repository.findPage(cursor),

    networkMode: 'always',

    ...FORCE_CACHE,

    gcTime: Infinity,
    retry: false,
  });
