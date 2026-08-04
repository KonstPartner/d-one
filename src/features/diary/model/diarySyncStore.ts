import { create } from 'zustand';

export type DiarySyncBatchType = 'automatic' | 'manual' | 'forced';

export type DiaryConnectionState = 'unknown' | 'offline' | 'online';

export type DiarySyncBatchProgress = {
  current: number;
  total: number;
};

type EntryActivityInput = {
  userId: string;
  entryId: string;
  active: boolean;
};

type BatchStartInput = {
  userId: string;
  operationId: string;
  type: DiarySyncBatchType;
  total: number;
};

type BatchProgressInput = {
  userId: string;
  operationId: string;
  current: number;
  total: number;
};

type BatchFinishInput = Pick<BatchProgressInput, 'userId' | 'operationId'>;

type DiarySyncState = {
  activeUserId: string | null;
  syncingEntryIds: ReadonlySet<string>;
  preparingEntryIds: ReadonlySet<string>;
  batchProgress: DiarySyncBatchProgress | null;
  batchType: DiarySyncBatchType | null;
  connectionState: DiaryConnectionState;
  batchOperationId: string | null;
  activateUser: (userId: string) => void;
  setEntrySyncing: (input: EntryActivityInput) => void;
  setEntryPreparing: (input: EntryActivityInput) => void;
  startBatch: (input: BatchStartInput) => void;
  updateBatchProgress: (input: BatchProgressInput) => void;
  finishBatch: (input: BatchFinishInput) => void;
  setConnectionState: (
    userId: string,
    connectionState: DiaryConnectionState
  ) => void;
  reset: () => void;
};

const EMPTY_SYNC_STATE = {
  activeUserId: null,
  syncingEntryIds: new Set<string>(),
  preparingEntryIds: new Set<string>(),
  batchProgress: null,
  batchType: null,
  connectionState: 'unknown' as const,
  batchOperationId: null,
};

const updateEntrySet = (
  currentIds: ReadonlySet<string>,
  entryId: string,
  active: boolean
): ReadonlySet<string> => {
  const nextIds = new Set(currentIds);

  if (active) {
    nextIds.add(entryId);
  } else {
    nextIds.delete(entryId);
  }

  return nextIds;
};

export const useDiarySyncStore = create<DiarySyncState>((set) => ({
  ...EMPTY_SYNC_STATE,

  activateUser: (userId) => {
    set((state) => {
      if (state.activeUserId === userId) {
        return state;
      }

      return {
        ...EMPTY_SYNC_STATE,
        activeUserId: userId,
      };
    });
  },

  setEntrySyncing: ({ userId, entryId, active }) => {
    set((state) => {
      if (state.activeUserId !== userId) {
        return state;
      }

      return {
        syncingEntryIds: updateEntrySet(state.syncingEntryIds, entryId, active),
      };
    });
  },

  setEntryPreparing: ({ userId, entryId, active }) => {
    set((state) => {
      if (state.activeUserId !== userId) {
        return state;
      }

      return {
        preparingEntryIds: updateEntrySet(
          state.preparingEntryIds,
          entryId,
          active
        ),
      };
    });
  },

  startBatch: ({ userId, operationId, type, total }) => {
    set((state) => {
      if (state.activeUserId !== userId) {
        return state;
      }

      return {
        batchOperationId: operationId,
        batchType: type,
        batchProgress: {
          current: 0,
          total,
        },
      };
    });
  },

  updateBatchProgress: ({ userId, operationId, current, total }) => {
    set((state) => {
      if (
        state.activeUserId !== userId ||
        state.batchOperationId !== operationId
      ) {
        return state;
      }

      return {
        batchProgress: {
          current,
          total,
        },
      };
    });
  },

  finishBatch: ({ userId, operationId }) => {
    set((state) => {
      if (
        state.activeUserId !== userId ||
        state.batchOperationId !== operationId
      ) {
        return state;
      }

      return {
        batchOperationId: null,
        batchType: null,
        batchProgress: null,
      };
    });
  },

  setConnectionState: (userId, connectionState) => {
    set((state) => {
      if (state.activeUserId !== userId) {
        return state;
      }

      return { connectionState };
    });
  },

  reset: () => {
    set({
      ...EMPTY_SYNC_STATE,
      syncingEntryIds: new Set<string>(),
      preparingEntryIds: new Set<string>(),
    });
  },
}));

export const activateDiarySyncUser = (userId: string): void => {
  useDiarySyncStore.getState().activateUser(userId);
};

export const resetDiarySyncRuntime = (userId?: string): void => {
  const state = useDiarySyncStore.getState();

  if (userId !== undefined && state.activeUserId !== userId) {
    return;
  }

  state.reset();
};
