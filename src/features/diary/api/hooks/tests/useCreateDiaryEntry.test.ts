import useCreateDiaryEntry from '../../../api/hooks/useCreateDiaryEntry';
import type { CreateDiaryEntryData } from '../../../model/types';

const mockUseMutation = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockCreate = jest.fn();
const mockResetListState = jest.fn();
const mockUseReadyDiaryDatabase = jest.fn();

const mockDb = {};
const mockCollectionReference = {};
const mockMutationResult = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQueryClient: () => ({
    invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
  }),
}));

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
}));

jest.mock('@features/auth/api/firebase/config', () => ({
  get db() {
    return mockDb;
  },
}));

jest.mock('../../../model/store', () => ({
  useDiaryListStore: (
    selector: (state: { resetListState: typeof mockResetListState }) => unknown
  ) =>
    selector({
      resetListState: mockResetListState,
    }),
}));

jest.mock('../../sqlite/DiaryDatabaseProvider', () => ({
  useReadyDiaryDatabase: () => mockUseReadyDiaryDatabase(),
}));

type MutationOptions = {
  mutationKey: readonly unknown[];
  mutationFn: (data: CreateDiaryEntryData) => Promise<string>;
  onSuccess: () => void;
  networkMode: string;
  retry: boolean;
};

const createData = (
  overrides: Partial<CreateDiaryEntryData> = {}
): CreateDiaryEntryData => ({
  glucose: 6.4,
  mealRelation: 'afterMeal',
  shortInsulin: 3,
  longInsulin: null,
  carbsGram: 42,
  comment: 'Dinner',
  eventAt: new Date('2026-08-02T18:30:00.000Z'),
  ...overrides,
});

const getMutationOptions = (): MutationOptions =>
  mockUseMutation.mock.calls[0][0] as MutationOptions;

describe('useCreateDiaryEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseReadyDiaryDatabase.mockReturnValue({
      userId: 'user-1',
      repository: {
        create: mockCreate,
      },
    });

    mockUseMutation.mockReturnValue(mockMutationResult);
    mockCollection.mockReturnValue(mockCollectionReference);
    mockDoc.mockReturnValue({
      id: 'entry-1',
    });
    mockCreate.mockResolvedValue(undefined);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it('configures an offline local mutation for the current user', () => {
    const result = useCreateDiaryEntry();
    const options = getMutationOptions();

    expect(result).toBe(mockMutationResult);

    expect(options.mutationKey).toEqual(['diary', 'local', 'user-1', 'create']);
    expect(options.networkMode).toBe('always');
    expect(options.retry).toBe(false);
  });

  it('generates an entry ID and creates the SQLite entry', async () => {
    useCreateDiaryEntry();

    const options = getMutationOptions();
    const data = createData();

    await expect(options.mutationFn(data)).resolves.toBe('entry-1');

    expect(mockCollection).toHaveBeenCalledWith(
      mockDb,
      'users',
      'user-1',
      'diaryEntries'
    );
    expect(mockDoc).toHaveBeenCalledWith(mockCollectionReference);

    expect(mockCreate).toHaveBeenCalledWith({
      ...data,
      id: 'entry-1',
      localPhotoUri: null,
      photoPath: null,
    });
  });

  it('propagates a repository creation error', async () => {
    const error = new Error('SQLite insert failed');

    mockCreate.mockRejectedValue(error);

    useCreateDiaryEntry();

    const options = getMutationOptions();

    await expect(options.mutationFn(createData())).rejects.toBe(error);
  });

  it('resets the list and invalidates local pages after creation', () => {
    useCreateDiaryEntry();

    const options = getMutationOptions();

    options.onSuccess();

    expect(mockResetListState).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'user-1', 'pages'],
    });
  });

  it('does not turn a refresh failure into a creation failure', async () => {
    const error = new Error('Refresh failed');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockInvalidateQueries.mockRejectedValue(error);

    useCreateDiaryEntry();

    const options = getMutationOptions();

    expect(options.onSuccess()).toBeUndefined();

    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to refresh diary after entry creation',
      error
    );

    consoleError.mockRestore();
  });
});
