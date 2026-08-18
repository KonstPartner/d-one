import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { DiaryBackupEntry, DiaryEntry } from '@entities/diary';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { useDiaryImportSession } from '../useDiaryImportSession';

const mockFindByIds = jest.fn();
const mockApplyImportedBatch = jest.fn();

const mockValidateDiaryBackupArchive = jest.fn();
const mockReadDiaryImportChunkEntries = jest.fn();
const mockResolveDiaryImportPhotoUri = jest.fn();

const mockLeaseSetPhase = jest.fn();
const mockLeaseSetTotals = jest.fn();
const mockLeaseUpdateProgress = jest.fn();
const mockLeaseComplete = jest.fn();
const mockLeaseFail = jest.fn();
const mockLeaseCancel = jest.fn();

const mockResetDiaryTransferState = jest.fn();

const mockArchiveCleanup = jest.fn();

const mockLease = {
  operationId: 'import-test-operation',

  setPhase: mockLeaseSetPhase,
  setTotals: mockLeaseSetTotals,
  updateProgress: mockLeaseUpdateProgress,

  complete: mockLeaseComplete,
  fail: mockLeaseFail,
  cancel: mockLeaseCancel,
};

jest.mock('@entities/diary', () => {
  const { diaryLocalQueryKeys } = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryKeys'
  );

  const { DIARY_BACKUP_CHUNK_SIZE } = jest.requireActual(
    '@entities/diary/model/diaryBackup'
  );

  return {
    diaryLocalQueryKeys,
    DIARY_BACKUP_CHUNK_SIZE,

    beginDiaryTransfer: jest.fn(async () => mockLease),

    resetDiaryTransferState: () => {
      mockResetDiaryTransferState();
    },

    useReadyDiaryDatabase: () => ({
      userId: 'current-user',

      repository: {
        findByIds: mockFindByIds,
        applyImportedBatch: mockApplyImportedBatch,
      },
    }),

    prepareDiaryPhotoForEntry: jest.fn(),
    prepareDiaryPhotoRemoval: jest.fn(),
  };
});

jest.mock('../validateDiaryBackupArchive', () => ({
  validateDiaryBackupArchive: (...args: unknown[]) =>
    mockValidateDiaryBackupArchive(...args),
}));

jest.mock('../diaryImportArchiveReader', () => ({
  readDiaryImportChunkEntries: (...args: unknown[]) =>
    mockReadDiaryImportChunkEntries(...args),

  resolveDiaryImportPhotoUri: (...args: unknown[]) =>
    mockResolveDiaryImportPhotoUri(...args),
}));

jest.mock('@shared/lib/errors', () => ({
  errorMapper: jest.fn(() => 'mapped-transfer-error'),
}));

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

const createBackupEntry = (
  id: string,
  overrides: Partial<DiaryBackupEntry> = {}
): DiaryBackupEntry => ({
  id,

  glucose: 6.5,
  mealRelation: null,

  shortInsulin: null,
  longInsulin: null,
  carbsGram: null,

  comment: `backup:${id}`,
  aiAnalysis: '',

  photoFileName: null,
  photoUrl: null,

  eventAt: '2026-08-15T10:00:00.000Z',

  ...overrides,

  ultraShortInsulin: overrides.ultraShortInsulin ?? null,
});

const createLocalEntry = (
  id: string,
  overrides: Partial<DiaryEntry> = {}
): DiaryEntry => ({
  id,
  userId: 'current-user',

  glucose: 8.2,
  mealRelation: null,

  shortInsulin: null,
  longInsulin: null,
  carbsGram: null,

  comment: `local:${id}`,
  aiAnalysis: '',

  localPhotoUri: null,
  photoPath: null,
  photoUrl: null,

  eventAt: new Date('2026-08-14T10:00:00.000Z'),

  syncStatus: 'pendingDelete',

  ...overrides,

  ultraShortInsulin: overrides.ultraShortInsulin ?? null,
});

const createArchive = ({
  chunks,
  entryIds,
}: {
  chunks: readonly string[];
  entryIds: readonly string[];
}) => ({
  sourceFileName: 'backup.zip',
  payloadUri: 'file:///cache/import-payload',

  manifest: {
    app: 'd-one',
    formatVersion: 1,

    exportType: 'lightweightBackup' as const,

    exportedAt: '2026-08-15T12:00:00.000Z',

    sourceUserName: 'Backup User',
    sourceUserId: 'backup-user',

    entriesCount: entryIds.length,
    photosCount: 0,

    withPhotos: false as const,

    recordsScope: {
      type: 'all' as const,
    },

    chunks,
  },

  entryIds,

  cleanup: mockArchiveCleanup,
});

describe('useDiaryImportSession integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindByIds.mockReset();
    mockApplyImportedBatch.mockReset();

    mockValidateDiaryBackupArchive.mockReset();
    mockReadDiaryImportChunkEntries.mockReset();
    mockResolveDiaryImportPhotoUri.mockReset();

    mockResolveDiaryImportPhotoUri.mockReturnValue(null);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },

        mutations: {
          retry: false,
          gcTime: Infinity,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();

    jest.restoreAllMocks();
  });

  it('prepares conflicts, applies replace/new decisions and completes the import', async () => {
    const newEntryA = createBackupEntry('entry-new-a');
    const conflictEntry = createBackupEntry('entry-conflict');
    const newEntryB = createBackupEntry('entry-new-b');

    const localConflict = createLocalEntry('entry-conflict');

    const chunkPath = 'entries/entries_000001.json';

    const archive = createArchive({
      chunks: [chunkPath],

      entryIds: [newEntryA.id, conflictEntry.id, newEntryB.id],
    });

    mockValidateDiaryBackupArchive.mockResolvedValueOnce(archive);

    mockReadDiaryImportChunkEntries.mockImplementation(
      async ({ relativePath }: { relativePath: string }) =>
        relativePath === chunkPath ? [newEntryA, conflictEntry, newEntryB] : []
    );

    mockFindByIds.mockImplementation(async (entryIds: readonly string[]) =>
      entryIds.includes(localConflict.id) ? [localConflict] : []
    );

    mockApplyImportedBatch.mockResolvedValue(undefined);

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDiaryImportSession(), {
      wrapper: QueryProvider,
    });

    await act(async () => {
      const preview = await result.current.prepareSource({
        fileUri: 'file:///backup.zip',
        fileName: 'backup.zip',
      });

      expect(preview).toEqual(
        expect.objectContaining({
          entriesCount: 3,
          photosCount: 0,
          matchesCount: 1,
        })
      );
    });

    await waitFor(() => {
      expect(result.current.conflictItems).toHaveLength(1);
      expect(result.current.conflicts.plan).toBeNull();
    });

    expect(result.current.conflictItems[0]).toEqual(
      expect.objectContaining({
        entryId: 'entry-conflict',
        localEntry: localConflict,
        backupEntry: conflictEntry,
      })
    );

    act(() => {
      result.current.conflicts.resolveAll('replace');
    });

    await waitFor(() => {
      expect(result.current.conflicts.plan).toEqual({
        type: 'all',
        decision: 'replace',
      });
    });

    let executionStatus: 'completed' | 'failed' | null = null;

    await act(async () => {
      executionStatus = await result.current.executeImport();
    });

    expect(executionStatus).toBe('completed');

    expect(mockApplyImportedBatch).toHaveBeenCalledTimes(1);

    const appliedOperations = mockApplyImportedBatch.mock.calls[0]?.[0];

    expect(appliedOperations).toEqual([
      expect.objectContaining({
        type: 'insert',

        entry: expect.objectContaining({
          id: 'entry-new-a',
          comment: 'backup:entry-new-a',
        }),
      }),

      expect.objectContaining({
        type: 'replace',

        entry: expect.objectContaining({
          id: 'entry-conflict',
          comment: 'backup:entry-conflict',
        }),
      }),

      expect.objectContaining({
        type: 'insert',

        entry: expect.objectContaining({
          id: 'entry-new-b',
          comment: 'backup:entry-new-b',
        }),
      }),
    ]);

    expect(result.current.result).toEqual({
      totalEntries: 3,
      processedEntries: 3,

      addedEntries: 2,
      replacedEntries: 1,
      skippedEntries: 0,
    });

    expect(mockLeaseComplete).toHaveBeenCalledTimes(1);
    expect(mockLeaseFail).not.toHaveBeenCalled();

    expect(mockArchiveCleanup).toHaveBeenCalledTimes(1);

    expect(result.current.hasActiveSession).toBe(false);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'current-user'],
    });

    expect(showNotification).not.toHaveBeenCalled();
  });

  it('keeps committed chunks, refreshes local data and reports a partial failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const firstEntry = createBackupEntry('entry-first');
    const secondEntry = createBackupEntry('entry-second');

    const firstChunkPath = 'entries/entries_000001.json';
    const secondChunkPath = 'entries/entries_000002.json';

    const archive = createArchive({
      chunks: [firstChunkPath, secondChunkPath],

      entryIds: [firstEntry.id, secondEntry.id],
    });

    mockValidateDiaryBackupArchive.mockResolvedValueOnce(archive);

    mockReadDiaryImportChunkEntries.mockImplementation(
      async ({ relativePath }: { relativePath: string }) => {
        if (relativePath === firstChunkPath) {
          return [firstEntry];
        }

        if (relativePath === secondChunkPath) {
          return [secondEntry];
        }

        return [];
      }
    );

    mockFindByIds.mockResolvedValue([]);

    mockApplyImportedBatch
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('SQLite write failed'));

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDiaryImportSession(), {
      wrapper: QueryProvider,
    });

    await act(async () => {
      await result.current.prepareSource({
        fileUri: 'file:///backup.zip',
        fileName: 'backup.zip',
      });
    });

    await waitFor(() => {
      expect(result.current.conflicts.plan).toEqual({
        type: 'none',
      });
    });

    let executionStatus: 'completed' | 'failed' | null = null;

    await act(async () => {
      executionStatus = await result.current.executeImport();
    });

    expect(executionStatus).toBe('failed');

    expect(mockApplyImportedBatch).toHaveBeenCalledTimes(2);

    expect(mockApplyImportedBatch.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({
        type: 'insert',

        entry: expect.objectContaining({
          id: 'entry-first',
        }),
      }),
    ]);

    expect(mockApplyImportedBatch.mock.calls[1]?.[0]).toEqual([
      expect.objectContaining({
        type: 'insert',

        entry: expect.objectContaining({
          id: 'entry-second',
        }),
      }),
    ]);

    expect(mockLeaseFail).toHaveBeenCalledTimes(1);
    expect(mockLeaseComplete).not.toHaveBeenCalled();

    expect(mockArchiveCleanup).toHaveBeenCalledTimes(1);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'current-user'],
    });

    expect(errorMapper).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'DIARY_IMPORT_PARTIAL_FAILED',
      }),
      'transfer'
    );

    expect(showNotification).toHaveBeenCalledWith(
      'error',
      'mapped-transfer-error'
    );

    expect(result.current.hasActiveSession).toBe(false);
    expect(result.current.result).toBeNull();
  });
});
