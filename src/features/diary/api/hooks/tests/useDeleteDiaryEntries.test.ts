import { useDiaryListStore } from '../../../model/store';
import { createDefaultDiaryFilters } from '../../../model/types';
import useDeleteDiaryEntries from '../useDeleteDiaryEntries';

const mockUseMutation = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockMarkPendingDelete = jest.fn();
const mockFindPage = jest.fn();
const mockQueueDiaryEntriesForSync = jest.fn();
const mockUseReadyDiaryDatabase = jest.fn();

const mockMutationResult = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
};

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query'
  );

  return {
    ...actual,

    useMutation: (...args: unknown[]) => mockUseMutation(...args),

    useQueryClient: () => ({
      invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
    }),
  };
});

jest.mock('../../sqlite/DiaryDatabaseProvider', () => ({
  useReadyDiaryDatabase: () => mockUseReadyDiaryDatabase(),
}));

jest.mock('../../diarySyncCoordinator', () => ({
  queueDiaryEntriesForSync: (...args: unknown[]) =>
    mockQueueDiaryEntriesForSync(...args),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/config', () => ({
  db: {},
}));

type MutationOptions = {
  mutationKey: readonly unknown[];
  mutationFn: (ids: ReadonlyArray<string>) => Promise<string[]>;
  onSuccess: (entryIds: string[]) => void;
  networkMode: string;
  retry: boolean;
};

const getMutationOptions = (): MutationOptions =>
  mockUseMutation.mock.calls[0][0] as MutationOptions;

describe('useDeleteDiaryEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseReadyDiaryDatabase.mockReturnValue({
      userId: 'user-1',
      repository: {
        markPendingDelete: mockMarkPendingDelete,
        findPage: mockFindPage,
      },
    });

    mockUseMutation.mockReturnValue(mockMutationResult);
    useDiaryListStore.getState().resetListState();

    mockMarkPendingDelete.mockResolvedValue(undefined);
    mockFindPage.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 30,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
    mockQueueDiaryEntriesForSync.mockResolvedValue([]);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it('configures an offline local deletion mutation', () => {
    const result = useDeleteDiaryEntries();
    const options = getMutationOptions();

    expect(result).toBe(mockMutationResult);
    expect(options.mutationKey).toEqual(['diary', 'local', 'user-1', 'delete']);
    expect(options.networkMode).toBe('always');
    expect(options.retry).toBe(false);
  });

  it('marks unique selected entries for deletion', async () => {
    useDeleteDiaryEntries();

    const options = getMutationOptions();
    const ids = ['entry-1', 'entry-1', 'entry-2'];

    await expect(options.mutationFn(ids)).resolves.toEqual([
      'entry-1',
      'entry-2',
    ]);

    expect(mockMarkPendingDelete).toHaveBeenCalledWith(ids);
  });

  it('propagates a repository deletion error', async () => {
    const error = new Error('SQLite update failed');

    mockMarkPendingDelete.mockRejectedValue(error);

    useDeleteDiaryEntries();

    await expect(getMutationOptions().mutationFn(['entry-1'])).rejects.toBe(
      error
    );
  });

  it('invalidates local pages after deletion is marked', () => {
    useDeleteDiaryEntries();

    getMutationOptions().onSuccess(['entry-1']);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'user-1', 'pages'],
    });
  });

  it('recalculates the last page with the applied filters after physical deletion', async () => {
    const appliedFilters = createDefaultDiaryFilters();

    appliedFilters.glucose = {
      min: 5,
      max: 8,
    };
    appliedFilters.photo = 'has';

    useDiaryListStore.setState({
      currentPage: 3,
      appliedFilters,
    });

    mockQueueDiaryEntriesForSync.mockResolvedValue([
      {
        entryId: 'entry-1',
        status: 'deleted',
      },
    ]);
    mockFindPage.mockResolvedValue({
      items: [],
      pagination: {
        page: 3,
        pageSize: 30,
        totalItems: 60,
        totalPages: 2,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });

    useDeleteDiaryEntries();

    getMutationOptions().onSuccess(['entry-1']);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockFindPage).toHaveBeenCalledWith(3, appliedFilters);
    expect(useDiaryListStore.getState().currentPage).toBe(2);
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('keeps the current page when it is still valid for the applied filters', async () => {
    const appliedFilters = createDefaultDiaryFilters();

    appliedFilters.aiAnalysis = 'doesNotHave';

    useDiaryListStore.setState({
      currentPage: 2,
      appliedFilters,
    });

    mockQueueDiaryEntriesForSync.mockResolvedValue([
      {
        entryId: 'entry-1',
        status: 'deleted',
      },
    ]);
    mockFindPage.mockResolvedValue({
      items: [],
      pagination: {
        page: 2,
        pageSize: 30,
        totalItems: 31,
        totalPages: 2,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    });

    useDeleteDiaryEntries();

    getMutationOptions().onSuccess(['entry-1']);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockFindPage).toHaveBeenCalledWith(2, appliedFilters);
    expect(useDiaryListStore.getState().currentPage).toBe(2);
  });

  it('moves to the first page when the filtered result becomes empty', async () => {
    const appliedFilters = createDefaultDiaryFilters();

    appliedFilters.mealRelations = ['night'];

    useDiaryListStore.setState({
      currentPage: 2,
      appliedFilters,
    });

    mockQueueDiaryEntriesForSync.mockResolvedValue([
      {
        entryId: 'entry-1',
        status: 'deleted',
      },
    ]);
    mockFindPage.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 30,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });

    useDeleteDiaryEntries();

    getMutationOptions().onSuccess(['entry-1']);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(mockFindPage).toHaveBeenCalledWith(2, appliedFilters);
    expect(useDiaryListStore.getState().currentPage).toBe(1);
  });
});
