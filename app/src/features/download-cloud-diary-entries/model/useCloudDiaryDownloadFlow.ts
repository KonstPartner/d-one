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

  const mountedRef = useRef(true);

  const activeSessionRef = useRef<CloudDiaryDownloadSession | null>(null);

  const stepRef = useRef<CloudDiaryDownloadStep>('idle');

  const [step, setStep] = useState<CloudDiaryDownloadStep>('idle');

  const [conflicts, setConflicts] = useState<
    readonly CloudDiaryDownloadConflict[]
  >([]);

  const [reviewIndex, setReviewIndex] = useState(0);

  const [resolutions, setResolutions] = useState<
    Map<string, CloudDiaryDownloadConflictResolution>
  >(() => new Map());

  const [result, setResult] = useState<DownloadCloudEntriesResult | null>(null);

  const setFlowStep = useCallback((nextStep: CloudDiaryDownloadStep) => {
    stepRef.current = nextStep;

    setStep(nextStep);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      activeSessionRef.current?.cancel();

      activeSessionRef.current = null;
    };
  }, []);

  const resetFlow = useCallback(() => {
    activeSessionRef.current = null;

    setConflicts([]);

    setReviewIndex(0);

    setResolutions(new Map());

    setResult(null);

    setFlowStep('idle');
  }, [setFlowStep]);

  const finishWithResult = useCallback(
    (downloadResult: DownloadCloudEntriesResult) => {
      activeSessionRef.current = null;

      setConflicts([]);

      setReviewIndex(0);

      setResolutions(new Map());

      setResult(downloadResult);

      setFlowStep('result');
    },
    [setFlowStep]
  );

  const runComplete = useCallback(
    async (
      session: CloudDiaryDownloadSession,

      nextResolutions: CloudDiaryDownloadResolutionMap
    ): Promise<void> => {
      activeSessionRef.current = null;

      setFlowStep('processing');

      try {
        const downloadResult = await mutation.complete({
          session,
          resolutions: nextResolutions,
        });

        if (!mountedRef.current) {
          return;
        }

        finishWithResult(downloadResult);
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        setFlowStep('idle');

        throw error;
      }
    },
    [finishWithResult, mutation.complete, setFlowStep]
  );

  const start = useCallback(
    async (entries: readonly CloudDiaryEntry[]): Promise<void> => {
      if (stepRef.current !== 'idle') {
        return;
      }

      setResult(null);

      setFlowStep('checking');

      try {
        const session = await mutation.begin(entries);

        if (!mountedRef.current) {
          session.cancel();

          return;
        }

        activeSessionRef.current = session;

        setConflicts(session.conflicts);

        setReviewIndex(0);

        setResolutions(new Map());

        if (session.conflicts.length === 0) {
          await runComplete(session, new Map());

          return;
        }

        setFlowStep('strategy');
      } catch (error) {
        activeSessionRef.current = null;

        if (!mountedRef.current) {
          return;
        }

        setFlowStep('idle');

        throw error;
      }
    },
    [mutation.begin, runComplete, setFlowStep]
  );

  const chooseStrategy = useCallback(
    async (strategy: CloudDiaryDownloadConflictStrategy): Promise<void> => {
      if (stepRef.current !== 'strategy') {
        return;
      }

      const session = activeSessionRef.current;

      if (session === null) {
        return;
      }

      if (strategy === 'review') {
        setReviewIndex(0);

        setResolutions(new Map());

        setFlowStep('review');

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
    [conflicts, runComplete, setFlowStep]
  );

  const resolveCurrent = useCallback(
    async (
      resolution: CloudDiaryDownloadConflictResolution,

      applyToRemaining = false
    ): Promise<void> => {
      if (stepRef.current !== 'review') {
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
    [conflicts, resolutions, reviewIndex, runComplete]
  );

  const cancel = useCallback(() => {
    if (stepRef.current !== 'strategy' && stepRef.current !== 'review') {
      return;
    }

    activeSessionRef.current?.cancel();

    resetFlow();
  }, [resetFlow]);

  const closeResult = useCallback(() => {
    if (stepRef.current !== 'result') {
      return;
    }

    resetFlow();
  }, [resetFlow]);

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
