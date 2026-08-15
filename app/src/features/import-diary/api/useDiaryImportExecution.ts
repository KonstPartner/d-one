import { type MutableRefObject, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { diaryLocalQueryKeys, type DiaryTransferLease } from '@entities/diary';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { isDiaryImportExecutionError } from '../model/diaryImportExecutionError';
import { getDiaryImportPlanSummary } from '../model/diaryImportPlanSummary';
import type { DiaryImportConflictPlan } from '../model/useDiaryImportConflicts';

import {
  type DiaryImportExecutionResult,
  DiaryImportExecutionService,
} from './DiaryImportExecutionService';
import type { DiaryPreparedImportSession } from './DiaryImportPreparationService';

type UseDiaryImportExecutionParams = {
  service: DiaryImportExecutionService;

  userId: string;

  sessionRef: MutableRefObject<DiaryPreparedImportSession | null>;

  leaseRef: MutableRefObject<DiaryTransferLease | null>;

  conflictPlan: DiaryImportConflictPlan | null;
};

export type DiaryImportExecutionRunStatus = 'completed' | 'failed';

const hasLocalDiaryChanges = (result: DiaryImportExecutionResult): boolean =>
  result.addedEntries > 0 || result.replacedEntries > 0;

export const useDiaryImportExecution = ({
  service,
  userId,
  sessionRef,
  leaseRef,
  conflictPlan,
}: UseDiaryImportExecutionParams) => {
  const queryClient = useQueryClient();

  const [result, setResult] = useState<DiaryImportExecutionResult | null>(null);

  const [isImporting, setIsImporting] = useState(false);

  const reset = useCallback((): void => {
    setResult(null);
    setIsImporting(false);
  }, []);

  const refreshLocalDiary = useCallback(
    async (importResult: DiaryImportExecutionResult): Promise<void> => {
      if (!hasLocalDiaryChanges(importResult)) {
        return;
      }

      try {
        await queryClient.invalidateQueries({
          queryKey: diaryLocalQueryKeys.root(userId),
        });
      } catch (error) {
        console.error('Failed to refresh local diary after import', error);

        showNotification(
          'error',
          errorMapper(new Error('DIARY_IMPORT_REFRESH_FAILED'), 'transfer')
        );
      }
    },
    [queryClient, userId]
  );

  const execute =
    useCallback(async (): Promise<DiaryImportExecutionRunStatus | null> => {
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

      try {
        const summary = getDiaryImportPlanSummary({
          preview: session.preview,

          conflictItems: session.conflictItems,

          plan: conflictPlan,
        });

        lease.setTotals({
          totalEntries: summary.entriesCount,

          totalPhotos: summary.photosCount,
        });

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

        await refreshLocalDiary(outcome.result);

        if (outcome.status === 'completed') {
          setResult(outcome.result);

          lease.complete();

          return 'completed';
        }

        console.error('Failed to import diary backup', outcome.error);

        const rollbackFailed =
          isDiaryImportExecutionError(outcome.error) &&
          outcome.error.code === 'fileRollbackFailed';

        showNotification(
          'error',
          errorMapper(
            outcome.result.processedEntries > 0 && !rollbackFailed
              ? new Error('DIARY_IMPORT_PARTIAL_FAILED')
              : outcome.error,
            'transfer'
          )
        );

        lease.fail();

        return 'failed';
      } catch (error) {
        console.error('Failed to execute diary import', error);

        showNotification('error', errorMapper(error, 'transfer'));

        lease.fail();

        return 'failed';
      } finally {
        session.cleanup();

        if (sessionRef.current === session) {
          sessionRef.current = null;
        }

        if (leaseRef.current === lease) {
          leaseRef.current = null;
        }

        setIsImporting(false);
      }
    }, [
      conflictPlan,
      isImporting,
      leaseRef,
      refreshLocalDiary,
      service,
      sessionRef,
    ]);

  return {
    result,
    isImporting,

    execute,
    reset,
  };
};
