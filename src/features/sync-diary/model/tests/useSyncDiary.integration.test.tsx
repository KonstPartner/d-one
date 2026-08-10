import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { DiaryEntry } from '@entities/diary';

import {
  queueDiaryEntriesForSync,
  queueForcedDiaryEntriesForSync,
  queuePendingDiaryEntriesForSync,
} from '../syncDiaryCoordinator';
import { useSyncDiary } from '../useSyncDiary';

const mockFindById = jest.fn();

jest.mock('@entities/diary', () => {
  const { diaryLocalQueryKeys } = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryKeys'
  );

  return {
    diaryLocalQueryKeys,

    useReadyDiaryDatabase: () => ({
      userId: 'user-1',

      repository: {
        findById: mockFindById,
      },
    }),
  };
});

jest.mock('../syncDiaryCoordinator', () => ({
  queueDiaryEntriesForSync: jest.fn(),

  queueForcedDiaryEntriesForSync: jest.fn(),

  queuePendingDiaryEntriesForSync: jest.fn(),
}));

const mockQueueDiaryEntriesForSync = jest.mocked(queueDiaryEntriesForSync);

const mockQueueForcedDiaryEntriesForSync = jest.mocked(
  queueForcedDiaryEntriesForSync
);

const mockQueuePendingDiaryEntriesForSync = jest.mocked(
  queuePendingDiaryEntriesForSync
);

const createEntry = (overrides: Partial<DiaryEntry> = {}): DiaryEntry => ({
  id: 'entry-1',
  userId: 'user-1',

  glucose: 6.5,
  mealRelation: null,
  shortInsulin: null,
  longInsulin: null,
  carbsGram: null,

  comment: '',
  aiAnalysis: '',

  localPhotoUri: null,
  photoPath: null,
  photoUrl: null,

  eventAt: new Date('2026-08-10T12:00:00.000Z'),

  syncStatus: 'pendingCreate',

  ...overrides,
});

describe('useSyncDiary integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindById.mockReset();

    mockQueueDiaryEntriesForSync.mockReset();
    mockQueueForcedDiaryEntriesForSync.mockReset();
    mockQueuePendingDiaryEntriesForSync.mockReset();

    mockQueueDiaryEntriesForSync.mockResolvedValue([]);

    mockQueueForcedDiaryEntriesForSync.mockResolvedValue([]);

    mockQueuePendingDiaryEntriesForSync.mockResolvedValue([]);

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

  it('returns null when entry no longer exists', async () => {
    mockFindById.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let preparedEntry: DiaryEntry | null = createEntry();

    await act(async () => {
      preparedEntry = await result.current.prepareEntryPhoto('entry-1');
    });

    expect(mockFindById).toHaveBeenCalledWith('entry-1');

    expect(preparedEntry).toBeNull();
  });

  it('returns entry unchanged when it has no local photo', async () => {
    const entry = createEntry();

    mockFindById.mockResolvedValueOnce(entry);

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let preparedEntry: DiaryEntry | null = null;

    await act(async () => {
      preparedEntry = await result.current.prepareEntryPhoto('entry-1');
    });

    expect(preparedEntry).toEqual(entry);
  });

  it('returns entry unchanged when cloud photo is already prepared', async () => {
    const entry = createEntry({
      localPhotoUri: 'file:///photo.jpg',

      photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',

      photoUrl: 'https://storage.example/photo.jpg',
    });

    mockFindById.mockResolvedValueOnce(entry);

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let preparedEntry: DiaryEntry | null = null;

    await act(async () => {
      preparedEntry = await result.current.prepareEntryPhoto('entry-1');
    });

    expect(preparedEntry).toEqual(entry);
  });

  it('rejects local photo without Storage path before reaching cloud gateway', async () => {
    const entry = createEntry({
      localPhotoUri: 'file:///photo.jpg',

      photoPath: null,

      photoUrl: null,
    });

    mockFindById.mockResolvedValueOnce(entry);

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let error: unknown = null;

    await act(async () => {
      try {
        await result.current.prepareEntryPhoto('entry-1');
      } catch (caughtError) {
        error = caughtError;
      }
    });

    expect(error).toEqual(
      new Error('Diary entry photo does not have a Storage path: entry-1')
    );
  });

  it('delegates targeted synchronization and refreshes local diary afterwards', async () => {
    const syncResults: Awaited<ReturnType<typeof queueDiaryEntriesForSync>> = [
      {
        entryId: 'entry-1',
        status: 'synced',
      },
    ];

    mockQueueDiaryEntriesForSync.mockResolvedValueOnce(syncResults);

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let resultValue: Awaited<
      ReturnType<typeof queueDiaryEntriesForSync>
    > | null = null;

    await act(async () => {
      resultValue = await result.current.syncEntries(['entry-1']);
    });

    expect(mockQueueDiaryEntriesForSync).toHaveBeenCalledTimes(1);

    expect(mockQueueDiaryEntriesForSync).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',

        entryIds: ['entry-1'],
      })
    );

    expect(resultValue).toEqual(syncResults);

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it('refreshes local diary even when targeted synchronization fails', async () => {
    mockQueueDiaryEntriesForSync.mockRejectedValueOnce(
      new Error('Synchronization failed')
    );

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSyncDiary(), {
      wrapper: QueryProvider,
    });

    let error: unknown = null;

    await act(async () => {
      try {
        await result.current.syncEntries(['entry-1']);
      } catch (caughtError) {
        error = caughtError;
      }
    });

    expect(error).toEqual(new Error('Synchronization failed'));

    expect(mockQueueDiaryEntriesForSync).toHaveBeenCalledTimes(1);

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});
