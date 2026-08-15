import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import {
  beginDiaryTransfer,
  type DiaryTransferLease,
  resetDiaryTransferState,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

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

    userId,

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
      } catch (error) {
        console.error('Failed to choose diary backup', error);

        showNotification(
          'error',
          errorMapper(new Error('DIARY_IMPORT_PICKER_FAILED'), 'transfer')
        );

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
      } catch (error) {
        console.error('Failed to prepare diary import', error);

        sessionRef.current?.cleanup();
        sessionRef.current = null;

        lease?.fail();

        if (leaseRef.current === lease) {
          leaseRef.current = null;
        }

        showNotification('error', errorMapper(error, 'transfer'));

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
    setConflictItems([]);

    conflicts.reset();
    execution.reset();

    resetDiaryTransferState();
  }, [conflicts.reset, disposeActiveSession, execution.reset]);

  return {
    preview,

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
  };
};
