import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { showNotification } from '@shared/lib/notifications';

import { useOwnerDiarySelection } from '../useOwnerDiarySelection';

const mockMarkPendingDelete = jest.fn<Promise<void>, [ReadonlyArray<string>]>();

jest.mock('@entities/diary', () => {
  const { diaryLocalQueryKeys } = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryKeys'
  );

  return {
    diaryLocalQueryKeys,

    runDiaryWriteOperation: (operation: () => Promise<unknown>) => operation(),

    useReadyDiaryDatabase: () => ({
      userId: 'user-1',

      repository: {
        markPendingDelete: (entryIds: ReadonlyArray<string>) =>
          mockMarkPendingDelete(entryIds),
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

describe('useOwnerDiarySelection integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockMarkPendingDelete.mockReset();

    mockMarkPendingDelete.mockResolvedValue(undefined);

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

  it('enters selection mode and toggles entries', () => {
    const onEnter = jest.fn();

    const onEntriesMarkedForDeletion = jest.fn();

    const { result } = renderHook(
      () =>
        useOwnerDiarySelection({
          availableEntryIds: new Set(['entry-1', 'entry-2']),

          onEnter,

          onEntriesMarkedForDeletion,
        }),
      {
        wrapper: QueryProvider,
      }
    );

    expect(result.current.selectionMode).toBe(false);

    act(() => {
      result.current.enterSelection();
    });

    expect(result.current.selectionMode).toBe(true);

    expect(onEnter).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.toggleEntry('entry-1');
    });

    expect(result.current.selectedEntryIds.has('entry-1')).toBe(true);

    expect(result.current.selectedCount).toBe(1);

    expect(result.current.allSelected).toBe(false);

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectedEntryIds).toEqual(
      new Set(['entry-1', 'entry-2'])
    );

    expect(result.current.allSelected).toBe(true);

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectedCount).toBe(0);
  });

  it('removes entries from selection when they become unavailable', async () => {
    const onEnter = jest.fn();

    const onEntriesMarkedForDeletion = jest.fn();

    type HookProps = {
      availableEntryIds: ReadonlySet<string>;
    };

    const { result, rerender } = renderHook(
      ({ availableEntryIds }: HookProps) =>
        useOwnerDiarySelection({
          availableEntryIds,

          onEnter,

          onEntriesMarkedForDeletion,
        }),
      {
        initialProps: {
          availableEntryIds: new Set(['entry-1', 'entry-2']),
        },

        wrapper: QueryProvider,
      }
    );

    act(() => {
      result.current.enterSelection();
    });

    expect(result.current.selectionMode).toBe(true);

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectedEntryIds).toEqual(
      new Set(['entry-1', 'entry-2'])
    );

    rerender({
      availableEntryIds: new Set(['entry-1']),
    });

    await waitFor(() => {
      expect(result.current.selectedEntryIds).toEqual(new Set(['entry-1']));
    });

    expect(result.current.selectedCount).toBe(1);

    expect(result.current.allSelected).toBe(true);
  });

  it('marks selected entries for deletion and exits selection mode', async () => {
    const onEnter = jest.fn();

    const onEntriesMarkedForDeletion = jest.fn();

    const { result } = renderHook(
      () =>
        useOwnerDiarySelection({
          availableEntryIds: new Set(['entry-1', 'entry-2']),

          onEnter,

          onEntriesMarkedForDeletion,
        }),
      {
        wrapper: QueryProvider,
      }
    );

    act(() => {
      result.current.enterSelection();
    });

    expect(result.current.selectionMode).toBe(true);

    act(() => {
      result.current.toggleEntry('entry-1');
    });

    expect(result.current.selectedCount).toBe(1);

    act(() => {
      result.current.requestDelete();
    });

    expect(result.current.deleteConfirmVisible).toBe(true);

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(mockMarkPendingDelete).toHaveBeenCalledTimes(1);

    expect(mockMarkPendingDelete).toHaveBeenCalledWith(['entry-1']);

    await waitFor(() => {
      expect(onEntriesMarkedForDeletion).toHaveBeenCalledWith(['entry-1']);
    });

    expect(result.current.selectionMode).toBe(false);

    expect(result.current.selectedCount).toBe(0);

    expect(result.current.deleteConfirmVisible).toBe(false);
  });

  it('keeps selection mode after local deletion error and shows notification', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockMarkPendingDelete.mockRejectedValueOnce(
      new Error('SQLite write failed')
    );

    const onEntriesMarkedForDeletion = jest.fn();

    const { result } = renderHook(
      () =>
        useOwnerDiarySelection({
          availableEntryIds: new Set(['entry-1']),

          onEnter: jest.fn(),

          onEntriesMarkedForDeletion,
        }),
      {
        wrapper: QueryProvider,
      }
    );

    act(() => {
      result.current.enterSelection();
    });

    expect(result.current.selectionMode).toBe(true);

    act(() => {
      result.current.toggleEntry('entry-1');
    });

    expect(result.current.selectedEntryIds.has('entry-1')).toBe(true);

    act(() => {
      result.current.requestDelete();
    });

    expect(result.current.deleteConfirmVisible).toBe(true);

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.selectionMode).toBe(true);

    expect(result.current.selectedEntryIds.has('entry-1')).toBe(true);

    expect(result.current.deleteConfirmVisible).toBe(false);

    expect(onEntriesMarkedForDeletion).not.toHaveBeenCalled();

    expect(jest.mocked(showNotification)).toHaveBeenCalledWith(
      'error',
      'diary.selection.deleteFailed'
    );
  });
});
