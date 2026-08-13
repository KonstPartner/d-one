import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { DiaryEntry } from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiaryPreparation } from '../useOwnerDiaryPreparation';

const mockFindById = jest.fn();
const mockUpdateAiAnalysis = jest.fn();
const mockUpdatePendingPhotoState = jest.fn();

const mockPrepareEntryPhoto = jest.fn();
const mockSetEntryPreparing = jest.fn();
const mockSyncEntries = jest.fn();

const mockAnalyzeFood = jest.fn();
const mockFormatAnalyzeFoodResult = jest.fn();

let mockConnectionState: 'unknown' | 'offline' | 'online' = 'online';

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
        updateAiAnalysis: mockUpdateAiAnalysis,
        updatePendingPhotoState: mockUpdatePendingPhotoState,
      },
    }),
  };
});

jest.mock('@features/sync-diary', () => ({
  useSyncDiary: () => ({
    connectionState: mockConnectionState,

    prepareEntryPhoto: mockPrepareEntryPhoto,
    setEntryPreparing: mockSetEntryPreparing,
    syncEntries: mockSyncEntries,
  }),
}));

jest.mock('@features/analyze-diary-photo', () => ({
  formatAnalyzeFoodResult: (...args: unknown[]) =>
    mockFormatAnalyzeFoodResult(...args),

  useAnalyzeFoodMutation: () => ({
    mutateAsync: mockAnalyzeFood,
  }),
}));

jest.mock('@shared/i18n', () => ({
  normalizeAppLanguage: () => 'ru',
}));

jest.mock('@shared/lib/errors', () => ({
  errorMapper: () => 'mapped-ai-error',
}));

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,

    i18n: {
      language: 'ru',
      resolvedLanguage: 'ru',
    },
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

  comment: 'Lunch',
  aiAnalysis: '',

  localPhotoUri: null,
  photoPath: null,
  photoUrl: null,

  eventAt: new Date('2026-08-13T10:00:00.000Z'),

  syncStatus: 'pendingUpdate',

  ...overrides,
});

describe('useOwnerDiaryPreparation integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockConnectionState = 'online';

    mockFindById.mockReset();
    mockUpdateAiAnalysis.mockReset();
    mockUpdatePendingPhotoState.mockReset();

    mockPrepareEntryPhoto.mockReset();
    mockSetEntryPreparing.mockReset();
    mockSyncEntries.mockReset();

    mockAnalyzeFood.mockReset();
    mockFormatAnalyzeFoodResult.mockReset();

    mockUpdateAiAnalysis.mockResolvedValue(undefined);
    mockUpdatePendingPhotoState.mockResolvedValue(undefined);

    mockSyncEntries.mockResolvedValue([]);

    mockFormatAnalyzeFoodResult.mockReturnValue('formatted ai analysis');

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

  it('uploads the photo, analyzes it, saves AI analysis and synchronizes the entry', async () => {
    const localEntry = createEntry({
      localPhotoUri: 'file:///photo.jpg',
      photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
      photoUrl: null,

      syncStatus: 'pendingCreate',
    });

    const uploadedEntry = {
      ...localEntry,

      photoUrl: 'https://storage.example/photo.jpg',
    };

    const analyzeResult = {
      status: 'ok',

      food: 'Pasta',

      calories: {
        min: 500,
        max: 600,
      },

      protein: {
        min: 20,
        max: 25,
      },

      fat: {
        min: 15,
        max: 20,
      },

      carbohydrates: {
        min: 70,
        max: 80,
      },

      confidence: 'high',

      assumptions: [],
    };

    mockFindById.mockResolvedValueOnce(localEntry);
    mockPrepareEntryPhoto.mockResolvedValueOnce(uploadedEntry);
    mockAnalyzeFood.mockResolvedValueOnce(analyzeResult);

    const { result } = renderHook(() => useOwnerDiaryPreparation(), {
      wrapper: QueryProvider,
    });

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'create',

        entryUpdated: true,

        requestAi: true,
        deleteAiAnalysis: false,
      });
    });

    expect(mockPrepareEntryPhoto).toHaveBeenCalledTimes(1);
    expect(mockPrepareEntryPhoto).toHaveBeenCalledWith('entry-1');

    expect(mockAnalyzeFood).toHaveBeenCalledTimes(1);
    expect(mockAnalyzeFood).toHaveBeenCalledWith({
      entryId: 'entry-1',

      photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
      photoUrl: 'https://storage.example/photo.jpg',

      comment: 'Lunch',

      language: 'ru',
    });

    expect(mockFormatAnalyzeFoodResult).toHaveBeenCalledWith(
      analyzeResult,
      'ru'
    );

    expect(mockUpdateAiAnalysis).toHaveBeenCalledTimes(1);
    expect(mockUpdateAiAnalysis).toHaveBeenCalledWith({
      id: 'entry-1',
      aiAnalysis: 'formatted ai analysis',
    });

    expect(mockSyncEntries).toHaveBeenCalledTimes(1);
    expect(mockSyncEntries).toHaveBeenCalledWith(['entry-1']);

    expect(mockSetEntryPreparing).toHaveBeenNthCalledWith(1, 'entry-1', true);
    expect(mockSetEntryPreparing).toHaveBeenLastCalledWith('entry-1', false);

    expect(result.current.preparingEntry).toBeNull();
  });

  it('keeps the old AI analysis and does not synchronize an AI-only update when analysis fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockFindById.mockResolvedValueOnce(
      createEntry({
        aiAnalysis: 'old ai analysis',

        photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
        photoUrl: 'https://storage.example/photo.jpg',
      })
    );

    mockAnalyzeFood.mockRejectedValueOnce(new Error('AI request failed'));

    const { result } = renderHook(() => useOwnerDiaryPreparation(), {
      wrapper: QueryProvider,
    });

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'update',

        entryUpdated: false,

        requestAi: true,
        deleteAiAnalysis: false,
      });
    });

    expect(mockAnalyzeFood).toHaveBeenCalledTimes(1);

    expect(mockUpdateAiAnalysis).not.toHaveBeenCalled();
    expect(mockUpdatePendingPhotoState).not.toHaveBeenCalled();

    expect(mockSyncEntries).not.toHaveBeenCalled();

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'mapped-ai-error'
    );

    expect(mockSetEntryPreparing).toHaveBeenNthCalledWith(1, 'entry-1', true);
    expect(mockSetEntryPreparing).toHaveBeenLastCalledWith('entry-1', false);

    expect(result.current.preparingEntry).toBeNull();
  });

  it('does not call AI when requestAi is false and synchronizes ordinary entry changes', async () => {
    mockFindById.mockResolvedValueOnce(
      createEntry({
        photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
        photoUrl: 'https://storage.example/photo.jpg',
      })
    );

    const { result } = renderHook(() => useOwnerDiaryPreparation(), {
      wrapper: QueryProvider,
    });

    await act(async () => {
      await result.current.handleEntrySaved({
        entryId: 'entry-1',

        operation: 'update',

        entryUpdated: true,

        requestAi: false,
        deleteAiAnalysis: false,
      });
    });

    expect(mockPrepareEntryPhoto).not.toHaveBeenCalled();
    expect(mockAnalyzeFood).not.toHaveBeenCalled();

    expect(mockUpdateAiAnalysis).not.toHaveBeenCalled();

    expect(mockSyncEntries).toHaveBeenCalledTimes(1);
    expect(mockSyncEntries).toHaveBeenCalledWith(['entry-1']);

    expect(mockSetEntryPreparing).not.toHaveBeenCalled();

    expect(result.current.preparingEntry).toBeNull();
  });
});
