import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { diaryLocalQueryKeys, useReadyDiaryDatabase } from '@entities/diary';

import type {
  DiaryExportRequest,
  DiaryExportResult,
} from '../model/diaryExport.types';

import { DiaryExportService } from './DiaryExportService';
import { diaryExportFilesQueryKey } from './useDiaryExportFiles';

type DiaryExportMutationInput =
  | {
      type: 'export';
      request: DiaryExportRequest;
    }
  | {
      type: 'resume';
      exportId: string;
    };

export const useDiaryExportMutation = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const service = useMemo(
    () => new DiaryExportService(userId, repository),
    [repository, userId]
  );

  const mutation = useMutation<
    DiaryExportResult | null,
    Error,
    DiaryExportMutationInput
  >({
    mutationKey: [...diaryLocalQueryKeys.root(userId), 'export'],

    mutationFn: (input) => {
      switch (input.type) {
        case 'export':
          return service.export(input.request);

        case 'resume':
          return service.resume(input.exportId);
      }
    },

    networkMode: 'always',

    retry: false,

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: diaryExportFilesQueryKey(userId),
      });
    },
  });

  return {
    exportDiary: (request: DiaryExportRequest) =>
      mutation.mutateAsync({
        type: 'export',
        request,
      }),

    resumeDiaryExport: (exportId: string) =>
      mutation.mutateAsync({
        type: 'resume',
        exportId,
      }),

    isExporting: mutation.isPending,

    result: mutation.data ?? null,

    error: mutation.error,

    reset: mutation.reset,
  };
};
