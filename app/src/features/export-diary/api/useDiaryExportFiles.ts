import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  diaryLocalQueryKeys,
  type DiaryStoredExportFile,
  useReadyDiaryDatabase,
} from '@entities/diary';

import type { DiaryUnfinishedExport } from '../model/diaryUnfinishedExport';

import { DiaryExportService } from './DiaryExportService';

export type DiaryExportFilesSnapshot = {
  finished: DiaryStoredExportFile[];
  unfinished: DiaryUnfinishedExport[];
};

type DeleteDiaryExportFilesInput =
  | {
      type: 'finished';
      fileNames: readonly string[];
    }
  | {
      type: 'unfinished';
      exportId: string;
    };

export const diaryExportFilesQueryKey = (
  userId: string
): readonly unknown[] => [...diaryLocalQueryKeys.root(userId), 'exportFiles'];

export const useDiaryExportFiles = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const service = useMemo(
    () => new DiaryExportService(userId, repository),
    [repository, userId]
  );

  const queryKey = diaryExportFilesQueryKey(userId);

  const filesQuery = useQuery<DiaryExportFilesSnapshot, Error>({
    queryKey,

    queryFn: () => ({
      finished: service.listFinished(),
      unfinished: service.listUnfinished(),
    }),

    networkMode: 'always',

    staleTime: Infinity,
  });

  const deleteMutation = useMutation<void, Error, DeleteDiaryExportFilesInput>({
    mutationKey: [...queryKey, 'delete'],

    mutationFn: async (input) => {
      switch (input.type) {
        case 'finished':
          service.deleteFinished(input.fileNames);

          return;

        case 'unfinished':
          service.deleteUnfinished(input.exportId);

          return;
      }
    },

    networkMode: 'always',

    retry: false,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  return {
    finishedExports: filesQuery.data?.finished ?? [],
    unfinishedExports: filesQuery.data?.unfinished ?? [],

    isLoading: filesQuery.isPending,
    isRefreshing: filesQuery.isFetching,
    loadError: filesQuery.error,

    refresh: filesQuery.refetch,

    deleteFinishedExports: (fileNames: readonly string[]) =>
      deleteMutation.mutateAsync({
        type: 'finished',
        fileNames,
      }),

    deleteUnfinishedExport: (exportId: string) =>
      deleteMutation.mutateAsync({
        type: 'unfinished',
        exportId,
      }),

    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    resetDelete: deleteMutation.reset,
  };
};
