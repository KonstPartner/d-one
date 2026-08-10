import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import {
  createDefaultDiaryEntryQuery,
  type DiaryEntry,
  type DiaryEntryQuery,
  type DiaryPageResult,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiaryList } from '../useOwnerDiaryList';

const mockFindPage = jest.fn<
  Promise<DiaryPageResult>,
  [number, DiaryEntryQuery]
>();

jest.mock('@entities/diary', () => {
  const { diaryLocalPageQueryOptions } = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryOptions'
  );

  const { createDefaultDiaryEntryQuery } = jest.requireActual(
    '@entities/diary/api/local/diaryRepository.types'
  );

  const { groupDiaryEntriesByDay } = jest.requireActual(
    '@entities/diary/lib/groupDiaryEntriesByDay'
  );

  return {
    diaryLocalPageQueryOptions,

    createDefaultDiaryEntryQuery,

    groupDiaryEntriesByDay,

    useReadyDiaryDatabase: () => ({
      userId: 'user-1',

      repository: {
        findPage: (page: number, query: DiaryEntryQuery) =>
          mockFindPage(page, query),
      },
    }),
  };
});

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createEntry = (id: string, eventAt: Date): DiaryEntry => ({
  id,

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

  eventAt,

  syncStatus: 'synced',
});

const createPage = (
  page: number,
  items: DiaryEntry[],
  totalPages: number
): DiaryPageResult => ({
  items,

  pagination: {
    page,

    pageSize: 30,

    totalItems: totalPages <= 1 ? items.length : 31,

    totalPages,

    hasPreviousPage: page > 1,

    hasNextPage: page < totalPages,
  },
});

describe('useOwnerDiaryList integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindPage.mockReset();

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

  it('loads local page, builds day group and collapses it', async () => {
    const diaryQuery = createDefaultDiaryEntryQuery();

    const page = createPage(
      1,
      [
        createEntry('entry-1', new Date('2026-08-10T12:00:00.000Z')),

        createEntry('entry-2', new Date('2026-08-10T13:00:00.000Z')),
      ],
      1
    );

    mockFindPage.mockResolvedValue(page);

    const { result } = renderHook(() => useOwnerDiaryList(diaryQuery), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.page).toEqual(page);
    });

    expect(mockFindPage).toHaveBeenCalledWith(1, diaryQuery);

    const headers = result.current.listItems.filter(
      (item) => item.type === 'dayHeader'
    );

    const entryIds = result.current.listItems.flatMap((item) =>
      item.type === 'entry' ? [item.entry.id] : []
    );

    expect(headers).toHaveLength(1);

    expect(entryIds).toEqual(['entry-1', 'entry-2']);

    const firstHeader = result.current.listItems.find(
      (item) => item.type === 'dayHeader'
    );

    if (firstHeader === undefined || firstHeader.type !== 'dayHeader') {
      throw new Error('Expected diary day header');
    }

    act(() => {
      result.current.toggleDay(firstHeader.dayKey);
    });

    expect(
      result.current.listItems.filter((item) => item.type === 'entry')
    ).toHaveLength(0);

    expect(result.current.collapsedDayKeys.has(firstHeader.dayKey)).toBe(true);
  });

  it('loads the next page and resets collapsed days', async () => {
    const diaryQuery = createDefaultDiaryEntryQuery();

    const pageOne = createPage(
      1,
      [createEntry('entry-1', new Date('2026-08-10T12:00:00.000Z'))],
      2
    );

    const pageTwo = createPage(
      2,
      [createEntry('entry-2', new Date('2026-08-09T12:00:00.000Z'))],
      2
    );

    mockFindPage.mockImplementation(async (page) =>
      page === 2 ? pageTwo : pageOne
    );

    const { result } = renderHook(() => useOwnerDiaryList(diaryQuery), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.page?.pagination.page).toBe(1);
    });

    const firstHeader = result.current.listItems.find(
      (item) => item.type === 'dayHeader'
    );

    if (firstHeader === undefined || firstHeader.type !== 'dayHeader') {
      throw new Error('Expected diary day header');
    }

    act(() => {
      result.current.toggleDay(firstHeader.dayKey);
    });

    expect(result.current.collapsedDayKeys.size).toBe(1);

    await act(async () => {
      await result.current.handleChangePage(2);
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);

      expect(result.current.page?.pagination.page).toBe(2);
    });

    expect(mockFindPage).toHaveBeenCalledWith(2, diaryQuery);

    expect(result.current.collapsedDayKeys.size).toBe(0);

    expect(
      result.current.listItems.some(
        (item) => item.type === 'entry' && item.entry.id === 'entry-2'
      )
    ).toBe(true);
  });

  it('keeps the current page when loading the next page fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const diaryQuery = createDefaultDiaryEntryQuery();

    const pageOne = createPage(
      1,
      [createEntry('entry-1', new Date('2026-08-10T12:00:00.000Z'))],
      2
    );

    mockFindPage
      .mockResolvedValueOnce(pageOne)
      .mockRejectedValueOnce(new Error('SQLite read failed'));

    const { result } = renderHook(() => useOwnerDiaryList(diaryQuery), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.page?.pagination.page).toBe(1);
    });

    await act(async () => {
      await result.current.handleChangePage(2);
    });

    expect(result.current.currentPage).toBe(1);

    expect(result.current.page?.pagination.page).toBe(1);

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'diary.list.loadFailed'
    );
  });
});
