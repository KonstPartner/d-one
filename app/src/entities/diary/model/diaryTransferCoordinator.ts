import { create } from 'zustand';

export type DiaryTransferType = 'import' | 'export' | 'cloudDownload';

export type DiaryTransferPhase =
  | 'idle'
  | 'waitingForSync'
  | 'validating'
  | 'resolvingConflicts'
  | 'processing'
  | 'completed'
  | 'failed';

export type DiaryTransferState = {
  type: DiaryTransferType | null;
  phase: DiaryTransferPhase;

  processedEntries: number;
  totalEntries: number;

  processedPhotos: number;
  totalPhotos: number;
};

type ActiveDiaryTransferPhase =
  | 'validating'
  | 'resolvingConflicts'
  | 'processing';

type DiaryTransferProgress = {
  processedEntries?: number;
  processedPhotos?: number;
};

type DiaryTransferTotals = {
  totalEntries: number;
  totalPhotos?: number;
};

type BeginDiaryTransferInput = {
  userId: string;
  type: DiaryTransferType;

  totalEntries?: number;
  totalPhotos?: number;
};

type ActiveTransfer = {
  operationId: string;
  userId: string;
};

export type DiarySyncOperationLease = {
  release: () => void;
};

export type DiaryTransferLease = {
  operationId: string;

  setPhase: (phase: ActiveDiaryTransferPhase) => void;

  setTotals: (totals: DiaryTransferTotals) => void;

  updateProgress: (progress: DiaryTransferProgress) => void;

  complete: () => void;
  fail: () => void;
  cancel: () => void;
};

const createInitialState = (): DiaryTransferState => ({
  type: null,
  phase: 'idle',

  processedEntries: 0,
  totalEntries: 0,

  processedPhotos: 0,
  totalPhotos: 0,
});

const useDiaryTransferStore = create<DiaryTransferState>(() =>
  createInitialState()
);

let activeTransfer: ActiveTransfer | null = null;

let nextTransferId = 0;

let activeSyncOperations = 0;

let syncIdlePromise: Promise<void> | null = null;

let resolveSyncIdle: (() => void) | null = null;

let transferReleasedPromise: Promise<void> | null = null;

let resolveTransferReleased: (() => void) | null = null;

const isValidCount = (value: number): boolean =>
  Number.isInteger(value) && value >= 0;

const waitForSyncIdle = (): Promise<void> => {
  if (activeSyncOperations === 0) {
    return Promise.resolve();
  }

  if (syncIdlePromise === null) {
    syncIdlePromise = new Promise<void>((resolve) => {
      resolveSyncIdle = resolve;
    });
  }

  return syncIdlePromise;
};

const notifySyncIdle = (): void => {
  if (activeSyncOperations !== 0) {
    return;
  }

  const resolve = resolveSyncIdle;

  resolveSyncIdle = null;
  syncIdlePromise = null;

  resolve?.();
};

const reserveTransfer = (transfer: ActiveTransfer): void => {
  if (activeTransfer !== null) {
    throw new Error('Another diary transfer is already active');
  }

  let resolveReleased: (() => void) | null = null;

  const releasedPromise = new Promise<void>((resolve) => {
    resolveReleased = resolve;
  });

  activeTransfer = transfer;

  transferReleasedPromise = releasedPromise;

  resolveTransferReleased = resolveReleased;
};

const releaseTransfer = (operationId: string): void => {
  if (activeTransfer?.operationId !== operationId) {
    return;
  }

  activeTransfer = null;

  const resolve = resolveTransferReleased;

  resolveTransferReleased = null;

  transferReleasedPromise = null;

  resolve?.();
};

const isCurrentTransfer = (operationId: string): boolean =>
  activeTransfer?.operationId === operationId;

const setTransferPhase = (
  operationId: string,
  phase: ActiveDiaryTransferPhase
): void => {
  if (!isCurrentTransfer(operationId)) {
    return;
  }

  useDiaryTransferStore.setState({
    phase,
  });
};

const setTransferTotals = (
  operationId: string,
  { totalEntries, totalPhotos = 0 }: DiaryTransferTotals
): void => {
  if (!isCurrentTransfer(operationId)) {
    return;
  }

  if (!isValidCount(totalEntries) || !isValidCount(totalPhotos)) {
    throw new Error('Invalid diary transfer totals');
  }

  const state = useDiaryTransferStore.getState();

  if (
    state.processedEntries > totalEntries ||
    state.processedPhotos > totalPhotos
  ) {
    throw new Error('Diary transfer totals are below current progress');
  }

  useDiaryTransferStore.setState({
    totalEntries,
    totalPhotos,
  });
};

const updateTransferProgress = (
  operationId: string,
  { processedEntries, processedPhotos }: DiaryTransferProgress
): void => {
  if (!isCurrentTransfer(operationId)) {
    return;
  }

  useDiaryTransferStore.setState((state) => ({
    processedEntries: processedEntries ?? state.processedEntries,

    processedPhotos: processedPhotos ?? state.processedPhotos,
  }));
};

const finishTransfer = (
  operationId: string,
  phase: 'completed' | 'failed'
): void => {
  if (!isCurrentTransfer(operationId)) {
    return;
  }

  useDiaryTransferStore.setState({
    phase,
  });

  releaseTransfer(operationId);
};

const cancelTransfer = (operationId: string): void => {
  if (!isCurrentTransfer(operationId)) {
    return;
  }

  useDiaryTransferStore.setState(createInitialState());

  releaseTransfer(operationId);
};

export const useDiaryTransferState = (): DiaryTransferState =>
  useDiaryTransferStore();

export const isDiaryTransferLocked = (): boolean => activeTransfer !== null;

export const acquireDiarySyncOperation =
  async (): Promise<DiarySyncOperationLease> => {
    while (activeTransfer !== null) {
      const releasePromise = transferReleasedPromise;

      if (releasePromise === null) {
        continue;
      }

      await releasePromise;
    }

    activeSyncOperations += 1;

    let released = false;

    return {
      release: () => {
        if (released) {
          return;
        }

        released = true;

        activeSyncOperations -= 1;

        notifySyncIdle();
      },
    };
  };

export const beginDiaryTransfer = async ({
  userId,
  type,

  totalEntries = 0,
  totalPhotos = 0,
}: BeginDiaryTransferInput): Promise<DiaryTransferLease> => {
  if (
    userId.length === 0 ||
    !isValidCount(totalEntries) ||
    !isValidCount(totalPhotos)
  ) {
    throw new Error('Invalid diary transfer request');
  }

  const operationId = `diary-transfer-${++nextTransferId}`;

  reserveTransfer({
    operationId,
    userId,
  });

  useDiaryTransferStore.setState({
    type,
    phase: 'waitingForSync',

    processedEntries: 0,
    totalEntries,

    processedPhotos: 0,
    totalPhotos,
  });

  await waitForSyncIdle();

  return {
    operationId,

    setPhase: (phase) => {
      setTransferPhase(operationId, phase);
    },

    setTotals: (totals) => {
      setTransferTotals(operationId, totals);
    },

    updateProgress: (progress) => {
      updateTransferProgress(operationId, progress);
    },

    complete: () => {
      finishTransfer(operationId, 'completed');
    },

    fail: () => {
      finishTransfer(operationId, 'failed');
    },

    cancel: () => {
      cancelTransfer(operationId);
    },
  };
};

export const resetDiaryTransferState = (): void => {
  if (activeTransfer !== null) {
    return;
  }

  useDiaryTransferStore.setState(createInitialState());
};
