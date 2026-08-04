import { useEffect, useRef } from 'react';

import { type ConnectionState, useNetwork } from '@features/network/model';

import {
  activateDiarySyncUser,
  resetDiarySyncRuntime,
  useDiarySyncStore,
} from '../../model/diarySyncStore';
import { queuePendingDiaryEntriesForSync } from '../diarySyncCoordinator';
import { useReadyDiaryDatabase } from '../sqlite/DiaryDatabaseProvider';

const useDiarySyncRuntime = (): void => {
  const { status } = useNetwork();
  const { userId, repository } = useReadyDiaryDatabase();

  const previousConnectionRef = useRef<ConnectionState>('unknown');
  const startupResolvedRef = useRef(false);

  useEffect(() => {
    previousConnectionRef.current = 'unknown';
    startupResolvedRef.current = false;
    activateDiarySyncUser(userId);

    return () => {
      resetDiarySyncRuntime(userId);
    };
  }, [repository, userId]);

  useEffect(() => {
    activateDiarySyncUser(userId);
    useDiarySyncStore.getState().setConnectionState(userId, status);

    const previousConnection = previousConnectionRef.current;
    let shouldSynchronize = false;

    if (!startupResolvedRef.current && status !== 'unknown') {
      startupResolvedRef.current = true;
      shouldSynchronize = status === 'online';
    } else if (previousConnection === 'offline' && status === 'online') {
      shouldSynchronize = true;
    }

    previousConnectionRef.current = status;

    if (!shouldSynchronize) {
      return;
    }

    void queuePendingDiaryEntriesForSync({
      userId,
      repository,
      batchType: 'automatic',
    }).catch((error) => {
      console.error('Automatic diary synchronization failed', error);
    });
  }, [repository, status, userId]);
};

export default useDiarySyncRuntime;
