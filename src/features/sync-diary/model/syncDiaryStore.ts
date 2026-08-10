import { create } from 'zustand';

import type { NetworkStatus } from '@shared/lib/network';

export type DiarySyncBatchType = 'automatic' | 'manual' | 'forced';

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

type SyncDiaryState = {
  activeUserId: string | null;

  syncingEntryIds: ReadonlySet<string>;

  batchProgress: DiarySyncBatchProgress | null;
  batchType: DiarySyncBatchType | null;
  batchOperationId: string | null;

  connectionState: NetworkStatus;

  activateUser: (userId: string) => void;

  setEntrySyncing: (input: EntryActivityInput) => void;

  startBatch: (input: BatchStartInput) => void;

  updateBatchProgress: (input: BatchProgressInput) => void;

  finishBatch: (input: BatchFinishInput) => void;

  setConnectionState: (userId: string, connectionState: NetworkStatus) => void;

  reset: () => void;
};

const createEmptySyncState = () => ({
  activeUserId: null as string | null,

  syncingEntryIds: new Set<string>() as ReadonlySet<string>,

  batchProgress: null as DiarySyncBatchProgress | null,

  batchType: null as DiarySyncBatchType | null,

  batchOperationId: null as string | null,

  connectionState: 'unknown' as NetworkStatus,
});

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

export const useSyncDiaryStore = create<SyncDiaryState>((set) => ({
  ...createEmptySyncState(),

  activateUser: (userId) => {
    set((state) => {
      if (state.activeUserId === userId) {
        return state;
      }

      return {
        ...createEmptySyncState(),
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

      return {
        connectionState,
      };
    });
  },

  reset: () => {
    set(createEmptySyncState());
  },
}));

export const activateSyncDiaryUser = (userId: string): void => {
  useSyncDiaryStore.getState().activateUser(userId);
};

export const resetSyncDiaryRuntime = (userId?: string): void => {
  const state = useSyncDiaryStore.getState();

  if (userId !== undefined && state.activeUserId !== userId) {
    return;
  }

  state.reset();
};
