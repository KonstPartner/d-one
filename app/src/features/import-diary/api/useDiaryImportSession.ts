import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import {
  beginDiaryTransfer,
  type DiaryTransferLease,
  resetDiaryTransferState,
  useReadyDiaryDatabase,
} from '@entities/diary';

import type { DiaryImportConflictReviewItem } from '../model/diaryImportConflictReview';
import { useDiaryImportConflicts } from '../model/useDiaryImportConflicts';

import { DiaryImportExecutionService } from './DiaryImportExecutionService';
import type {
  DiaryImportPreview,
  DiaryImportSource,
  DiaryPreparedImportSession,
} from './DiaryImportPreparationService';
import { DiaryImportPreparationService } from './DiaryImportPreparationService';
import { useDiaryImportExecution } from './useDiaryImportExecution';

const ZIP_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
] as const;

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Unknown diary import error');

export const useDiaryImportSession = () => {
  const { userId, repository } = useReadyDiaryDatabase();

  const preparationService = useMemo(
    () => new DiaryImportPreparationService(repository),
    [repository]
  );

  const executionService = useMemo(
    () => new DiaryImportExecutionService(repository, userId),
    [repository, userId]
  );

  const [preview, setPreview] = useState<DiaryImportPreview | null>(null);

  const [error, setError] = useState<Error | null>(null);

  const [conflictItems, setConflictItems] = useState<
    readonly DiaryImportConflictReviewItem[]
  >([]);

  const conflictEntryIds = useMemo(
    () => conflictItems.map((item) => item.entryId),
    [conflictItems]
  );

  const conflicts = useDiaryImportConflicts(conflictEntryIds);

  const [isPicking, setIsPicking] = useState(false);

  const [isPreparing, setIsPreparing] = useState(false);

  const sessionRef = useRef<DiaryPreparedImportSession | null>(null);

  const leaseRef = useRef<DiaryTransferLease | null>(null);

  const execution = useDiaryImportExecution({
    service: executionService,

    sessionRef,
    leaseRef,

    conflictPlan: conflicts.plan,
  });

  const disposeActiveSession = useCallback((): void => {
    sessionRef.current?.cleanup();
    sessionRef.current = null;

    leaseRef.current?.cancel();
    leaseRef.current = null;
  }, []);

  useEffect(
    () => () => {
      disposeActiveSession();
    },
    [disposeActiveSession]
  );

  const chooseFromDevice =
    useCallback(async (): Promise<DiaryImportSource | null> => {
      if (
        isPicking ||
        isPreparing ||
        execution.isImporting ||
        sessionRef.current !== null
      ) {
        return null;
      }

      setIsPicking(true);
      setError(null);

      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [...ZIP_MIME_TYPES],
          multiple: false,
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return null;
        }

        const asset = result.assets[0];

        if (asset === undefined) {
          throw new Error('Selected diary backup is unavailable');
        }

        return {
          fileUri: asset.uri,
          fileName: asset.name,
        };
      } catch (nextError) {
        setError(toError(nextError));

        return null;
      } finally {
        setIsPicking(false);
      }
    }, [execution.isImporting, isPicking, isPreparing]);

  const prepareSource = useCallback(
    async (source: DiaryImportSource): Promise<DiaryImportPreview | null> => {
      if (
        isPreparing ||
        sessionRef.current !== null ||
        leaseRef.current !== null
      ) {
        return null;
      }

      setIsPreparing(true);
      setError(null);
      setPreview(null);
      setConflictItems([]);
      conflicts.reset();
      execution.reset();

      let lease: DiaryTransferLease | null = null;

      try {
        lease = await beginDiaryTransfer({
          userId,
          type: 'import',
        });

        leaseRef.current = lease;

        lease.setPhase('validating');

        const session = await preparationService.prepare(source, {
          onArchiveValidated: (manifest) => {
            lease?.setTotals({
              totalEntries: manifest.entriesCount,
              totalPhotos: manifest.photosCount,
            });
          },

          onConflictScanProgress: (processedEntries) => {
            lease?.updateProgress({
              processedEntries,
            });
          },
        });

        sessionRef.current = session;

        setPreview(session.preview);

        setConflictItems(session.conflictItems);

        lease.setPhase('resolvingConflicts');

        return session.preview;
      } catch (nextError) {
        sessionRef.current?.cleanup();
        sessionRef.current = null;

        lease?.fail();

        if (leaseRef.current === lease) {
          leaseRef.current = null;
        }

        setError(toError(nextError));

        return null;
      } finally {
        setIsPreparing(false);
      }
    },
    [conflicts.reset, execution.reset, isPreparing, preparationService, userId]
  );

  const cancelSession = useCallback((): void => {
    disposeActiveSession();

    setPreview(null);
    setError(null);
    setConflictItems([]);
    conflicts.reset();
    execution.reset();

    resetDiaryTransferState();
  }, [conflicts.reset, disposeActiveSession, execution.reset]);

  const clearError = useCallback((): void => {
    setError(null);
    execution.clearError();

    if (leaseRef.current === null) {
      resetDiaryTransferState();
    }
  }, [execution.clearError]);

  return {
    preview,

    error: error ?? execution.error,

    result: execution.result,

    conflictItems,
    conflictEntryIds,
    conflicts,

    isPicking,
    isPreparing,

    isImporting: execution.isImporting,

    hasActiveSession: sessionRef.current !== null,

    chooseFromDevice,
    prepareSource,

    executeImport: execution.execute,

    cancelSession,
    clearError,
  };
};
