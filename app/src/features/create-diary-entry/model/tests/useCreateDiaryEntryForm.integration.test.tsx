import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { showNotification } from '@shared/lib/notifications';

import {
  type CreateDiaryEntrySubmitResult,
  useCreateDiaryEntryForm,
} from '../useCreateDiaryEntryForm';

const mockRepositoryCreate = jest.fn();

const mockPickImage = jest.fn();
const mockTakeImage = jest.fn();

jest.mock('@entities/diary', () => {
  const editable = jest.requireActual(
    '@entities/diary/model/diaryEntryEditable'
  );

  const queryKeys = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryKeys'
  );

  const photoError = jest.requireActual(
    '@entities/diary/api/local/DiaryPhotoError'
  );

  return {
    ...editable,
    ...queryKeys,
    ...photoError,

    runDiaryWriteOperation: (operation: () => Promise<unknown>) => operation(),

    useReadyDiaryDatabase: () => ({
      userId: 'user-1',

      repository: {
        create: mockRepositoryCreate,
      },
    }),

    createDiaryPhotoDraft: jest.fn(),

    prepareDiaryPhotoForEntry: jest.fn(),

    removeDiaryPhotoDraft: jest.fn(),
  };
});

jest.mock('@shared/api', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),

  doc: jest.fn(() => ({
    id: 'entry-created',
  })),
}));

jest.mock('@shared/lib/media', () => ({
  useImagePicker: () => ({
    pickImage: mockPickImage,
    takeImage: mockTakeImage,
    isPicking: false,
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

describe('useCreateDiaryEntryForm integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepositoryCreate.mockReset();
    mockPickImage.mockReset();
    mockTakeImage.mockReset();

    mockPickImage.mockResolvedValue(null);
    mockTakeImage.mockResolvedValue(null);

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

  it('saves locally once and keeps submitting state until the form closes', async () => {
    let resolveCreate: (() => void) | null = null;

    mockRepositoryCreate.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve;
        })
    );

    type HookProps = {
      visible: boolean;
    };

    const { result, rerender } = renderHook(
      ({ visible }: HookProps) =>
        useCreateDiaryEntryForm({
          visible,
        }),
      {
        initialProps: {
          visible: true,
        },

        wrapper: QueryProvider,
      }
    );

    act(() => {
      result.current.handleGlucoseChange(6.5);
    });

    await waitFor(() => {
      expect(result.current.values.glucose).toBe(6.5);
    });

    let firstSubmit: Promise<CreateDiaryEntrySubmitResult | null>;

    act(() => {
      firstSubmit = result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    let secondResult: CreateDiaryEntrySubmitResult | null | undefined;

    await act(async () => {
      secondResult = await result.current.handleSubmit();
    });

    expect(secondResult).toBeNull();

    expect(mockRepositoryCreate).toHaveBeenCalledTimes(1);

    expect(mockRepositoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'entry-created',

        glucose: 6.5,

        localPhotoUri: null,
        photoPath: null,
      })
    );

    expect(resolveCreate).not.toBeNull();

    act(() => {
      resolveCreate?.();
    });

    let submitResult: CreateDiaryEntrySubmitResult | null = null;

    await act(async () => {
      submitResult = await firstSubmit;
    });

    expect(submitResult).toEqual({
      entryId: 'entry-created',
      requestAi: false,
      requestTimer: false,
    });

    expect(result.current.isSubmitting).toBe(true);

    rerender({
      visible: false,
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it('returns to editable state and shows notification when local save fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockRepositoryCreate.mockRejectedValueOnce(
      new Error('SQLite create failed')
    );

    const { result } = renderHook(
      () =>
        useCreateDiaryEntryForm({
          visible: true,
        }),
      {
        wrapper: QueryProvider,
      }
    );

    act(() => {
      result.current.handleGlucoseChange(7.1);
    });

    await waitFor(() => {
      expect(result.current.values.glucose).toBe(7.1);
    });

    let submitResult: CreateDiaryEntrySubmitResult | null | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(submitResult).toBeNull();

    expect(mockRepositoryCreate).toHaveBeenCalledTimes(1);

    expect(result.current.isSubmitting).toBe(false);

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'diary.form.errors.creationFailed'
    );
  });
});
