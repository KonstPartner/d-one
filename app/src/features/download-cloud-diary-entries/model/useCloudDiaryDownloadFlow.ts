import { useCallback, useEffect, useRef, useState } from 'react';

import type { CloudDiaryEntry } from '@entities/diary';

import { useDownloadCloudEntriesMutation } from '../api/useDownloadCloudEntriesMutation';

import type {
  CloudDiaryDownloadConflict,
  CloudDiaryDownloadConflictResolution,
  CloudDiaryDownloadConflictStrategy,
  CloudDiaryDownloadResolutionMap,
  CloudDiaryDownloadSession,
  DownloadCloudEntriesResult,
} from './cloudDiaryDownload.types';

export type CloudDiaryDownloadStep =
  | 'idle'
  | 'checking'
  | 'strategy'
  | 'review'
  | 'processing'
  | 'result';

export const useCloudDiaryDownloadFlow = () => {
  const mutation = useDownloadCloudEntriesMutation();

  const activeSessionRef = useRef<CloudDiaryDownloadSession | null>(null);

  const [step, setStep] = useState<CloudDiaryDownloadStep>('idle');

  const [conflicts, setConflicts] = useState<
    readonly CloudDiaryDownloadConflict[]
  >([]);

  const [reviewIndex, setReviewIndex] = useState(0);

  const [resolutions, setResolutions] = useState<
    Map<string, CloudDiaryDownloadConflictResolution>
  >(() => new Map());

  const [result, setResult] = useState<DownloadCloudEntriesResult | null>(null);

  useEffect(
    () => () => {
      activeSessionRef.current?.cancel();

      activeSessionRef.current = null;
    },
    []
  );

  const resetFlow = useCallback(() => {
    activeSessionRef.current = null;

    setConflicts([]);

    setReviewIndex(0);

    setResolutions(new Map());

    setResult(null);

    setStep('idle');
  }, []);

  const finishWithResult = useCallback(
    (downloadResult: DownloadCloudEntriesResult) => {
      activeSessionRef.current = null;

      setConflicts([]);

      setReviewIndex(0);

      setResolutions(new Map());

      setResult(downloadResult);

      setStep('result');
    },
    []
  );

  const runComplete = useCallback(
    async (
      session: CloudDiaryDownloadSession,

      nextResolutions: CloudDiaryDownloadResolutionMap
    ): Promise<void> => {
      setStep('processing');

      try {
        const downloadResult = await mutation.complete({
          session,
          resolutions: nextResolutions,
        });

        finishWithResult(downloadResult);
      } catch (error) {
        activeSessionRef.current = null;

        setStep('idle');

        throw error;
      }
    },
    [finishWithResult, mutation.complete]
  );

  const start = useCallback(
    async (entries: readonly CloudDiaryEntry[]): Promise<void> => {
      if (step !== 'idle') {
        return;
      }

      setResult(null);

      setStep('checking');

      try {
        const beginResult = await mutation.begin(entries);

        if (beginResult.status === 'completed') {
          finishWithResult(beginResult.result);

          return;
        }

        activeSessionRef.current = beginResult.session;

        setConflicts(beginResult.conflicts);

        setReviewIndex(0);

        setResolutions(new Map());

        setStep('strategy');
      } catch (error) {
        activeSessionRef.current = null;

        setStep('idle');

        throw error;
      }
    },
    [finishWithResult, mutation.begin, step]
  );

  const chooseStrategy = useCallback(
    async (strategy: CloudDiaryDownloadConflictStrategy): Promise<void> => {
      if (step !== 'strategy') {
        return;
      }

      const session = activeSessionRef.current;

      if (session === null) {
        return;
      }

      if (strategy === 'review') {
        setReviewIndex(0);

        setResolutions(new Map());

        setStep('review');

        return;
      }

      const resolution: CloudDiaryDownloadConflictResolution =
        strategy === 'replaceAll' ? 'replace' : 'skip';

      const nextResolutions = new Map<
        string,
        CloudDiaryDownloadConflictResolution
      >();

      for (const conflict of conflicts) {
        nextResolutions.set(conflict.cloudEntry.id, resolution);
      }

      setResolutions(nextResolutions);

      await runComplete(session, nextResolutions);
    },
    [conflicts, runComplete, step]
  );

  const resolveCurrent = useCallback(
    async (
      resolution: CloudDiaryDownloadConflictResolution,

      applyToRemaining = false
    ): Promise<void> => {
      if (step !== 'review') {
        return;
      }

      const session = activeSessionRef.current;

      const currentConflict = conflicts[reviewIndex];

      if (session === null || currentConflict === undefined) {
        return;
      }

      const nextResolutions = new Map(resolutions);

      nextResolutions.set(currentConflict.cloudEntry.id, resolution);

      if (applyToRemaining) {
        for (
          let index = reviewIndex + 1;
          index < conflicts.length;
          index += 1
        ) {
          const conflict = conflicts[index];

          if (conflict === undefined) {
            continue;
          }

          nextResolutions.set(conflict.cloudEntry.id, resolution);
        }
      }

      setResolutions(nextResolutions);

      const allResolved = nextResolutions.size === conflicts.length;

      if (allResolved) {
        await runComplete(session, nextResolutions);

        return;
      }

      setReviewIndex((currentIndex) => currentIndex + 1);
    },
    [conflicts, resolutions, reviewIndex, runComplete, step]
  );

  const cancel = useCallback(() => {
    if (step !== 'strategy' && step !== 'review') {
      return;
    }

    activeSessionRef.current?.cancel();

    resetFlow();
  }, [resetFlow, step]);

  const closeResult = useCallback(() => {
    if (step !== 'result') {
      return;
    }

    resetFlow();
  }, [resetFlow, step]);

  const currentConflict =
    step === 'review' ? (conflicts[reviewIndex] ?? null) : null;

  return {
    step,

    conflicts,

    currentConflict,

    reviewIndex,

    reviewNumber: currentConflict === null ? 0 : reviewIndex + 1,

    conflictsCount: conflicts.length,

    result,

    error: mutation.error,

    isChecking: step === 'checking',

    isProcessing: step === 'processing',

    canCancel: step === 'strategy' || step === 'review',

    start,

    chooseStrategy,

    resolveCurrent,

    cancel,

    closeResult,
  };
};
