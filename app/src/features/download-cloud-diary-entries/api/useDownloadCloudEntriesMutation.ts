import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type CloudDiaryEntry,
  diaryLocalQueryKeys,
  useReadyDiaryDatabase,
} from '@entities/diary';

import type {
  CloudDiaryDownloadResolutionMap,
  CloudDiaryDownloadSession,
} from '../model/cloudDiaryDownload.types';

import { CloudDiaryDownloadService } from './CloudDiaryDownloadService';

type CompleteCloudDiaryDownloadInput = {
  session: CloudDiaryDownloadSession;

  resolutions: CloudDiaryDownloadResolutionMap;
};

export const useDownloadCloudEntriesMutation = () => {
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const invalidateLocalDiary = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.pagesRoot(userId),
        }),

        queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.entriesRoot(userId),
        }),
      ]);
    } catch (error) {
      console.error(
        'Failed to refresh local diary after cloud download',
        error
      );
    }
  }, [queryClient, userId]);

  const service = useMemo(
    () =>
      new CloudDiaryDownloadService({
        userId,
        repository,

        onCommitted: invalidateLocalDiary,
      }),
    [invalidateLocalDiary, repository, userId]
  );

  const beginMutation = useMutation({
    mutationKey: [
      ...diaryLocalQueryKeys.root(userId),
      'cloudDownload',
      'begin',
    ],

    mutationFn: (entries: readonly CloudDiaryEntry[]) => service.begin(entries),

    networkMode: 'always',

    retry: false,
  });

  const completeMutation = useMutation({
    mutationKey: [
      ...diaryLocalQueryKeys.root(userId),
      'cloudDownload',
      'complete',
    ],

    mutationFn: ({ session, resolutions }: CompleteCloudDiaryDownloadInput) =>
      session.complete(resolutions),

    networkMode: 'always',

    retry: false,
  });

  return {
    begin: beginMutation.mutateAsync,

    complete: completeMutation.mutateAsync,

    isChecking: beginMutation.isPending,

    isProcessing: completeMutation.isPending,

    error: beginMutation.error ?? completeMutation.error,
  };
};
