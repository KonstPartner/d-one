import useDeleteDiaryEntries from '../useDeleteDiaryEntries';

const mockUseMutation = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockMarkPendingDelete = jest.fn();
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
  onSuccess: () => Promise<unknown>;
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
      },
    });

    mockUseMutation.mockReturnValue(mockMutationResult);
    mockMarkPendingDelete.mockResolvedValue(undefined);
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

  it('invalidates local pages after deletion is marked', async () => {
    useDeleteDiaryEntries();

    await getMutationOptions().onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'user-1', 'pages'],
    });
  });
});
