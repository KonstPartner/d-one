import useUpdateDiaryEntry from '../../../api/hooks/useUpdateDiaryEntry';
import type { UpdateDiaryEntryData } from '../../../model/types';

const mockUseMutation = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUpdate = jest.fn();
const mockResetListState = jest.fn();
const mockUseReadyDiaryDatabase = jest.fn();

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
  mutationFn: (data: UpdateDiaryEntryData) => Promise<string>;
  onSuccess: () => void;
  networkMode: string;
  retry: boolean;
};

const updateData = (
  overrides: Partial<UpdateDiaryEntryData> = {}
): UpdateDiaryEntryData => ({
  id: 'entry-1',
  glucose: 7.2,
  mealRelation: 'beforeMeal',
  shortInsulin: 4,
  longInsulin: 12,
  carbsGram: 55,
  comment: 'Updated dinner',
  eventAt: new Date('2026-08-03T18:45:00.000Z'),
  ...overrides,
});

const getMutationOptions = (): MutationOptions =>
  mockUseMutation.mock.calls[0][0] as MutationOptions;

describe('useUpdateDiaryEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseReadyDiaryDatabase.mockReturnValue({
      userId: 'user-1',
      repository: {
        update: mockUpdate,
      },
    });

    mockUseMutation.mockReturnValue(mockMutationResult);
    mockUpdate.mockResolvedValue(undefined);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it('configures an offline local mutation for the current user', () => {
    const result = useUpdateDiaryEntry();
    const options = getMutationOptions();

    expect(result).toBe(mockMutationResult);
    expect(options.mutationKey).toEqual(['diary', 'local', 'user-1', 'update']);
    expect(options.networkMode).toBe('always');
    expect(options.retry).toBe(false);
  });

  it('updates the SQLite entry and returns its ID', async () => {
    useUpdateDiaryEntry();

    const options = getMutationOptions();
    const data = updateData();

    await expect(options.mutationFn(data)).resolves.toBe('entry-1');
    expect(mockUpdate).toHaveBeenCalledWith(data);
  });

  it('propagates a repository update error', async () => {
    const error = new Error('SQLite update failed');

    mockUpdate.mockRejectedValue(error);

    useUpdateDiaryEntry();

    const options = getMutationOptions();

    await expect(options.mutationFn(updateData())).rejects.toBe(error);
  });

  it('resets the list and invalidates local pages after update', () => {
    useUpdateDiaryEntry();

    const options = getMutationOptions();

    options.onSuccess();

    expect(mockResetListState).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'user-1', 'pages'],
    });
  });

  it('does not turn a refresh failure into an update failure', async () => {
    const error = new Error('Refresh failed');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockInvalidateQueries.mockRejectedValue(error);

    useUpdateDiaryEntry();

    const options = getMutationOptions();

    expect(options.onSuccess()).toBeUndefined();

    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to refresh diary after entry update',
      error
    );

    consoleError.mockRestore();
  });
});
