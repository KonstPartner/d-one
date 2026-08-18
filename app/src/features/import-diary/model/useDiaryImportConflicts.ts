import { useCallback, useMemo, useState } from 'react';

export type DiaryImportConflictDecision = 'skip' | 'replace';

export type DiaryImportConflictPlan =
  | {
      type: 'none';
    }
  | {
      type: 'all';
      decision: DiaryImportConflictDecision;
    }
  | {
      type: 'individual';
      decisions: ReadonlyMap<string, DiaryImportConflictDecision>;
    };

type DiaryImportConflictMode = 'unresolved' | 'all' | 'individual';

type DiaryImportConflictState = {
  mode: DiaryImportConflictMode;

  bulkDecision: DiaryImportConflictDecision | null;

  individualDecisions: ReadonlyMap<string, DiaryImportConflictDecision>;
};

const createInitialState = (): DiaryImportConflictState => ({
  mode: 'unresolved',

  bulkDecision: null,

  individualDecisions: new Map(),
});

const getResolvedCount = (
  state: DiaryImportConflictState,
  conflictEntryIds: readonly string[]
): number => {
  if (state.mode === 'all' && state.bulkDecision !== null) {
    return conflictEntryIds.length;
  }

  if (state.mode !== 'individual') {
    return 0;
  }

  return conflictEntryIds.reduce(
    (count, entryId) =>
      state.individualDecisions.has(entryId) ? count + 1 : count,
    0
  );
};

const buildPlan = (
  state: DiaryImportConflictState,
  conflictEntryIds: readonly string[]
): DiaryImportConflictPlan | null => {
  if (conflictEntryIds.length === 0) {
    return {
      type: 'none',
    };
  }

  if (state.mode === 'all' && state.bulkDecision !== null) {
    return {
      type: 'all',
      decision: state.bulkDecision,
    };
  }

  if (
    state.mode !== 'individual' ||
    getResolvedCount(state, conflictEntryIds) !== conflictEntryIds.length
  ) {
    return null;
  }

  const decisions = new Map<string, DiaryImportConflictDecision>();

  for (const entryId of conflictEntryIds) {
    const decision = state.individualDecisions.get(entryId);

    if (decision === undefined) {
      return null;
    }

    decisions.set(entryId, decision);
  }

  return {
    type: 'individual',
    decisions,
  };
};

export const getDiaryImportConflictPlanDecision = ({
  plan,
  entryId,
}: {
  plan: DiaryImportConflictPlan;
  entryId: string;
}): DiaryImportConflictDecision | null => {
  switch (plan.type) {
    case 'none':
      return null;

    case 'all':
      return plan.decision;

    case 'individual':
      return plan.decisions.get(entryId) ?? null;
  }
};

export const useDiaryImportConflicts = (
  conflictEntryIds: readonly string[]
) => {
  const [state, setState] =
    useState<DiaryImportConflictState>(createInitialState);

  const conflictEntryIdSet = useMemo(
    () => new Set(conflictEntryIds),
    [conflictEntryIds]
  );

  const resolveAll = useCallback(
    (decision: DiaryImportConflictDecision): void => {
      if (conflictEntryIds.length === 0) {
        return;
      }

      setState({
        mode: 'all',

        bulkDecision: decision,

        individualDecisions: new Map(),
      });
    },
    [conflictEntryIds.length]
  );

  const startIndividualReview = useCallback((): void => {
    if (conflictEntryIds.length === 0) {
      return;
    }

    setState((current) => ({
      mode: 'individual',

      bulkDecision: null,

      individualDecisions:
        current.mode === 'individual' ? current.individualDecisions : new Map(),
    }));
  }, [conflictEntryIds.length]);

  const setIndividualDecision = useCallback(
    (entryId: string, decision: DiaryImportConflictDecision): void => {
      if (!conflictEntryIdSet.has(entryId)) {
        return;
      }

      setState((current) => {
        if (current.mode !== 'individual') {
          return current;
        }

        const nextDecisions = new Map(current.individualDecisions);

        nextDecisions.set(entryId, decision);

        return {
          mode: 'individual',

          bulkDecision: null,

          individualDecisions: nextDecisions,
        };
      });
    },
    [conflictEntryIdSet]
  );

  const clearIndividualDecision = useCallback((entryId: string): void => {
    setState((current) => {
      if (
        current.mode !== 'individual' ||
        !current.individualDecisions.has(entryId)
      ) {
        return current;
      }

      const nextDecisions = new Map(current.individualDecisions);

      nextDecisions.delete(entryId);

      return {
        ...current,

        individualDecisions: nextDecisions,
      };
    });
  }, []);

  const reset = useCallback((): void => {
    setState(createInitialState());
  }, []);

  const resolvedCount = useMemo(
    () => getResolvedCount(state, conflictEntryIds),
    [conflictEntryIds, state]
  );

  const plan = useMemo(
    () => buildPlan(state, conflictEntryIds),
    [conflictEntryIds, state]
  );

  const getDecision = useCallback(
    (entryId: string): DiaryImportConflictDecision | null => {
      if (!conflictEntryIdSet.has(entryId)) {
        return null;
      }

      if (state.mode === 'all') {
        return state.bulkDecision;
      }

      if (state.mode !== 'individual') {
        return null;
      }

      return state.individualDecisions.get(entryId) ?? null;
    },
    [conflictEntryIdSet, state]
  );

  return {
    mode: state.mode,

    resolvedCount,
    totalCount: conflictEntryIds.length,

    plan,

    resolveAll,
    startIndividualReview,

    setIndividualDecision,
    clearIndividualDecision,

    getDecision,

    reset,
  };
};
