import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { diaryLocalQueryKeys, useReadyDiaryDatabase } from '@entities/diary';
import type { NetworkStatus } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

import { queuePendingDiaryEntriesForSync } from './syncDiaryCoordinator';
import {
  activateSyncDiaryUser,
  resetSyncDiaryRuntime,
  useSyncDiaryStore,
} from './syncDiaryStore';

type UseSyncDiaryRuntimeParams = {
  connectionState: NetworkStatus;
};

export const useSyncDiaryRuntime = ({
  connectionState,
}: UseSyncDiaryRuntimeParams): void => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const previousConnectionRef = useRef<NetworkStatus>('unknown');

  const startupResolvedRef = useRef(false);

  useEffect(() => {
    previousConnectionRef.current = 'unknown';

    startupResolvedRef.current = false;

    activateSyncDiaryUser(userId);

    return () => {
      resetSyncDiaryRuntime(userId);
    };
  }, [repository, userId]);

  useEffect(() => {
    activateSyncDiaryUser(userId);

    useSyncDiaryStore.getState().setConnectionState(userId, connectionState);

    const previousConnection = previousConnectionRef.current;

    let shouldSynchronize = false;

    if (!startupResolvedRef.current && connectionState !== 'unknown') {
      startupResolvedRef.current = true;

      shouldSynchronize = connectionState === 'online';
    } else if (
      previousConnection === 'offline' &&
      connectionState === 'online'
    ) {
      shouldSynchronize = true;
    }

    previousConnectionRef.current = connectionState;

    if (!shouldSynchronize) {
      return;
    }

    let cancelled = false;

    void queuePendingDiaryEntriesForSync({
      userId,
      repository,
      batchType: 'automatic',
    })
      .then(async (results) => {
        if (cancelled || results.length === 0) {
          return;
        }

        try {
          await queryClient.invalidateQueries({
            queryKey: diaryLocalQueryKeys.pagesRoot(userId),
          });
        } catch (error) {
          console.error(
            'Failed to refresh diary after automatic synchronization',
            error
          );
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error('Automatic diary synchronization failed', error);

        showNotification('error', t('diary.sync.failed'));
      });

    return () => {
      cancelled = true;
    };
  }, [connectionState, queryClient, repository, t, userId]);
};
