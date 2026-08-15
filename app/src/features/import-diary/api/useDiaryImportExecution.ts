import { type MutableRefObject, useCallback, useState } from 'react';

import type { DiaryTransferLease } from '@entities/diary';

import type { DiaryImportConflictPlan } from '../model/useDiaryImportConflicts';

import {
  type DiaryImportExecutionResult,
  DiaryImportExecutionService,
} from './DiaryImportExecutionService';
import type { DiaryPreparedImportSession } from './DiaryImportPreparationService';

type UseDiaryImportExecutionParams = {
  service: DiaryImportExecutionService;

  sessionRef: MutableRefObject<DiaryPreparedImportSession | null>;

  leaseRef: MutableRefObject<DiaryTransferLease | null>;

  conflictPlan: DiaryImportConflictPlan | null;
};

export const useDiaryImportExecution = ({
  service,
  sessionRef,
  leaseRef,
  conflictPlan,
}: UseDiaryImportExecutionParams) => {
  const [result, setResult] = useState<DiaryImportExecutionResult | null>(null);

  const [error, setError] = useState<Error | null>(null);

  const [isImporting, setIsImporting] = useState(false);

  const reset = useCallback((): void => {
    setResult(null);
    setError(null);
    setIsImporting(false);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const execute =
    useCallback(async (): Promise<DiaryImportExecutionResult | null> => {
      if (
        isImporting ||
        sessionRef.current === null ||
        leaseRef.current === null ||
        conflictPlan === null
      ) {
        return null;
      }

      const session = sessionRef.current;
      const lease = leaseRef.current;

      setIsImporting(true);
      setResult(null);
      setError(null);

      lease.setPhase('processing');

      lease.updateProgress({
        processedEntries: 0,
        processedPhotos: 0,
      });

      const outcome = await service.execute({
        session,
        conflictPlan,
        onProgress: ({ processedEntries, processedPhotos }) => {
          lease.updateProgress({
            processedEntries,
            processedPhotos,
          });
        },
      });

      session.cleanup();

      if (sessionRef.current === session) {
        sessionRef.current = null;
      }

      setResult(outcome.result);

      if (outcome.status === 'completed') {
        lease.complete();
      } else {
        setError(outcome.error);
        lease.fail();
      }

      if (leaseRef.current === lease) {
        leaseRef.current = null;
      }

      setIsImporting(false);

      return outcome.result;
    }, [conflictPlan, isImporting, leaseRef, service, sessionRef]);

  return {
    result,
    error,
    isImporting,

    execute,

    clearError,
    reset,
  };
};
