import { act, renderHook, waitFor } from '@testing-library/react-native';

import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiarySync } from '../useOwnerDiarySync';

const mockSyncEntriesBatch = jest.fn();
const mockSyncForced = jest.fn();
const mockSyncPending = jest.fn();

let mockConnectionState: 'unknown' | 'offline' | 'online' = 'online';

let mockBatchProgress: {
  current: number;
  total: number;
} | null = null;

jest.mock('@features/sync-diary', () => ({
  useSyncDiary: () => ({
    connectionState: mockConnectionState,

    batchProgress: mockBatchProgress,

    batchType: null,

    syncingEntryIds: new Set(),

    syncEntriesBatch: mockSyncEntriesBatch,

    syncForced: mockSyncForced,

    syncPending: mockSyncPending,

    isEntrySyncing: () => false,
  }),
}));

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useOwnerDiarySync integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockConnectionState = 'online';
    mockBatchProgress = null;

    mockSyncEntriesBatch.mockReset();
    mockSyncForced.mockReset();
    mockSyncPending.mockReset();

    mockSyncEntriesBatch.mockResolvedValue([]);
    mockSyncForced.mockResolvedValue([]);
    mockSyncPending.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs manual synchronization and keeps pending state until it finishes', async () => {
    let resolveSync: (() => void) | null = null;

    mockSyncPending.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSync = resolve;
        })
    );

    const { result } = renderHook(() => useOwnerDiarySync());

    let syncPromise: Promise<boolean>;

    act(() => {
      syncPromise = result.current.handleManualSync();
    });

    await waitFor(() => {
      expect(result.current.manualSyncPending).toBe(true);
    });

    expect(mockSyncPending).toHaveBeenCalledTimes(1);

    act(() => {
      resolveSync?.();
    });

    let synchronized = false;

    await act(async () => {
      synchronized = await syncPromise;
    });

    expect(synchronized).toBe(true);

    expect(result.current.manualSyncPending).toBe(false);
  });

  it('runs forced synchronization for selected entries', async () => {
    const { result } = renderHook(() => useOwnerDiarySync());

    let synchronized = false;

    await act(async () => {
      synchronized = await result.current.handleForcedSync([
        'entry-1',
        'entry-2',
      ]);
    });

    expect(synchronized).toBe(true);

    expect(mockSyncForced).toHaveBeenCalledTimes(1);

    expect(mockSyncForced).toHaveBeenCalledWith(['entry-1', 'entry-2']);

    expect(result.current.forcedSyncPending).toBe(false);
  });

  it('reports whether deletion synchronization physically removed entries', async () => {
    mockSyncEntriesBatch.mockResolvedValueOnce([
      {
        entryId: 'entry-1',
        status: 'deleted',
      },
    ]);

    const { result } = renderHook(() => useOwnerDiarySync());

    let physicallyDeleted = false;

    await act(async () => {
      physicallyDeleted = await result.current.handleEntriesMarkedForDeletion([
        'entry-1',
      ]);
    });

    expect(physicallyDeleted).toBe(true);

    expect(mockSyncEntriesBatch).toHaveBeenCalledWith(['entry-1']);
  });

  it('does not start synchronization while offline', async () => {
    mockConnectionState = 'offline';

    const { result } = renderHook(() => useOwnerDiarySync());

    let manualResult = true;
    let forcedResult = true;
    let deletionResult = true;

    await act(async () => {
      manualResult = await result.current.handleManualSync();

      forcedResult = await result.current.handleForcedSync(['entry-1']);

      deletionResult = await result.current.handleEntriesMarkedForDeletion([
        'entry-1',
      ]);
    });

    expect(manualResult).toBe(false);
    expect(forcedResult).toBe(false);
    expect(deletionResult).toBe(false);

    expect(mockSyncPending).not.toHaveBeenCalled();
    expect(mockSyncForced).not.toHaveBeenCalled();
    expect(mockSyncEntriesBatch).not.toHaveBeenCalled();
  });

  it('shows notification when manual synchronization fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockSyncPending.mockRejectedValueOnce(new Error('Synchronization failed'));

    const { result } = renderHook(() => useOwnerDiarySync());

    let synchronized = true;

    await act(async () => {
      synchronized = await result.current.handleManualSync();
    });

    expect(synchronized).toBe(false);

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'diary.sync.failed'
    );

    expect(result.current.manualSyncPending).toBe(false);
  });
});
