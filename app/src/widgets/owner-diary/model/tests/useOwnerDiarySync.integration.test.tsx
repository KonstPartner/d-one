import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { DiaryEntry } from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiarySync } from '../useOwnerDiarySync';

const mockFindById = jest.fn();

const mockPrepareEntryPhoto = jest.fn();

const mockSyncEntries = jest.fn();

const mockSyncForced = jest.fn();

const mockSyncPending = jest.fn();

let mockConnectionState: 'unknown' | 'offline' | 'online' = 'online';

jest.mock('@entities/diary', () => ({
  useReadyDiaryDatabase: () => ({
    repository: {
      findById: mockFindById,
    },
  }),
}));

jest.mock('@features/sync-diary', () => ({
  useSyncDiary: () => ({
    connectionState: mockConnectionState,

    batchProgress: null,

    batchType: null,

    syncingEntryIds: new Set(),

    prepareEntryPhoto: mockPrepareEntryPhoto,

    syncEntries: mockSyncEntries,

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

describe('useOwnerDiarySync integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockConnectionState = 'online';

    mockFindById.mockReset();

    mockPrepareEntryPhoto.mockReset();

    mockSyncEntries.mockReset();

    mockSyncForced.mockReset();

    mockSyncPending.mockReset();

    mockSyncEntries.mockResolvedValue([]);

    mockSyncForced.mockResolvedValue([]);

    mockSyncPending.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('queues targeted sync immediately when entry has no photo to prepare', async () => {
    mockFindById.mockResolvedValueOnce(createEntry());

    const { result } = renderHook(() => useOwnerDiarySync());

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'create',
      });
    });

    expect(mockPrepareEntryPhoto).not.toHaveBeenCalled();

    expect(mockSyncEntries).toHaveBeenCalledTimes(1);

    expect(mockSyncEntries).toHaveBeenCalledWith(['entry-1']);

    expect(result.current.preparingSavedEntry).toBeNull();
  });

  it('shows preparation state while photo is uploading and queues sync only after upload completes', async () => {
    const entry = createEntry({
      localPhotoUri: 'file:///photo.jpg',

      photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',

      photoUrl: null,
    });

    mockFindById.mockResolvedValueOnce(entry);

    let resolvePreparation: (() => void) | null = null;

    mockPrepareEntryPhoto.mockImplementationOnce(
      () =>
        new Promise<DiaryEntry>((resolve) => {
          resolvePreparation = () => {
            resolve({
              ...entry,

              photoUrl: 'https://storage.example/photo.jpg',
            });
          };
        })
    );

    const { result } = renderHook(() => useOwnerDiarySync());

    let savePromise: Promise<void>;

    act(() => {
      savePromise = result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'create',
      });
    });

    await waitFor(() => {
      expect(result.current.preparingSavedEntry).toEqual({
        entryId: 'entry-1',

        operation: 'create',

        photoUri: 'file:///photo.jpg',
      });
    });

    expect(mockPrepareEntryPhoto).toHaveBeenCalledWith('entry-1');

    expect(mockSyncEntries).not.toHaveBeenCalled();

    expect(resolvePreparation).not.toBeNull();

    act(() => {
      resolvePreparation?.();
    });

    await act(async () => {
      await savePromise;
    });

    expect(result.current.preparingSavedEntry).toBeNull();

    expect(mockSyncEntries).toHaveBeenCalledTimes(1);

    expect(mockSyncEntries).toHaveBeenCalledWith(['entry-1']);
  });

  it('does not queue targeted sync when photo preparation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockFindById.mockResolvedValueOnce(
      createEntry({
        localPhotoUri: 'file:///photo.jpg',

        photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',

        photoUrl: null,
      })
    );

    mockPrepareEntryPhoto.mockRejectedValueOnce(
      new Error('Storage upload failed')
    );

    const { result } = renderHook(() => useOwnerDiarySync());

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'create',
      });
    });

    expect(mockPrepareEntryPhoto).toHaveBeenCalledWith('entry-1');

    expect(mockSyncEntries).not.toHaveBeenCalled();

    expect(result.current.preparingSavedEntry).toBeNull();

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'diary.form.photo.errors.storageFailed'
    );
  });

  it('does not prepare or synchronize saved entry while offline', async () => {
    mockConnectionState = 'offline';

    const { result } = renderHook(() => useOwnerDiarySync());

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'update',
      });
    });

    expect(mockFindById).not.toHaveBeenCalled();

    expect(mockPrepareEntryPhoto).not.toHaveBeenCalled();

    expect(mockSyncEntries).not.toHaveBeenCalled();
  });
});
