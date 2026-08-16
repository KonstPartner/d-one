import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { OwnerDiary } from './OwnerDiary';

jest.mock('@features/screen-help', () => ({
  OwnerDiaryHelp: () => null,
}));

type HeaderMenuItem = {
  key: string;

  disabled?: boolean;

  onPress: () => void | Promise<void>;
};

let mockHeaderMenuItems: HeaderMenuItem[] = [];

const mockMarkPendingDelete = jest.fn<Promise<void>, [ReadonlyArray<string>]>();

const mockExpandAllDays = jest.fn();

const mockCollapseAllDays = jest.fn();

const mockReconcileCurrentPage = jest.fn<Promise<boolean>, []>();

const mockHandleForcedSync = jest.fn<
  Promise<boolean>,
  [ReadonlyArray<string>]
>();

const mockHandleManualSync = jest.fn<Promise<boolean>, []>();

const mockHandleEntriesMarkedForDeletion = jest.fn<
  Promise<boolean>,
  [ReadonlyArray<string>]
>();

const mockOpenCreate = jest.fn();

const mockOpenEdit = jest.fn<Promise<boolean>, [string]>();

const mockCloseCreate = jest.fn();

const mockCloseEdit = jest.fn();

const mockHandleCreated = jest.fn();

const mockHandleUpdated = jest.fn();

const mockShowToolbar = jest.fn();

const mockHandleToolbarLayout = jest.fn();

const mockHandleToolbarScroll = jest.fn();

const mockHandleToolbarScrollBeginDrag = jest.fn();

const mockHandleToolbarScrollEndDrag = jest.fn();

const mockEntries = [
  {
    id: 'entry-available',

    userId: 'user-1',

    glucose: 6.5,

    mealRelation: null,

    shortInsulin: null,

    longInsulin: null,

    carbsGram: null,

    comment: 'Available entry',

    aiAnalysis: '',

    localPhotoUri: null,

    photoPath: null,

    photoUrl: null,

    eventAt: new Date('2026-08-10T12:00:00.000Z'),

    syncStatus: 'synced',
  },

  {
    id: 'entry-deleting',

    userId: 'user-1',

    glucose: 7.2,

    mealRelation: null,

    shortInsulin: null,

    longInsulin: null,

    carbsGram: null,

    comment: 'Deleting entry',

    aiAnalysis: '',

    localPhotoUri: null,

    photoPath: null,

    photoUrl: null,

    eventAt: new Date('2026-08-10T11:00:00.000Z'),

    syncStatus: 'pendingDelete',
  },

  {
    id: 'entry-syncing',

    userId: 'user-1',

    glucose: 8.1,

    mealRelation: null,

    shortInsulin: null,

    longInsulin: null,

    carbsGram: null,

    comment: 'Synchronizing entry',

    aiAnalysis: '',

    localPhotoUri: null,

    photoPath: null,

    photoUrl: null,

    eventAt: new Date('2026-08-10T10:00:00.000Z'),

    syncStatus: 'synced',
  },
] as const;

jest.mock('@entities/diary', () => {
  const React = require('react');

  const { Pressable, Text, View } = require('react-native');

  const { diaryLocalQueryKeys } = jest.requireActual(
    '@entities/diary/api/local/diaryLocalQueryKeys'
  );

  const DiaryLocalList = ({
    page,

    selectionActive = false,

    onToggleSelection,

    onOpenEntry,
  }: {
    page?: {
      items: ReadonlyArray<{
        id: string;
      }>;
    };

    selectionActive?: boolean;

    onToggleSelection?: (entryId: string) => void;

    onOpenEntry?: (entryId: string) => void;
  }) =>
    React.createElement(
      View,
      null,

      ...(page?.items ?? []).map((entry) =>
        React.createElement(
          Pressable,
          {
            key: entry.id,

            accessibilityRole: selectionActive ? 'checkbox' : 'button',

            accessibilityLabel: `entry:${entry.id}`,

            onPress: () => {
              if (selectionActive) {
                onToggleSelection?.(entry.id);

                return;
              }

              onOpenEntry?.(entry.id);
            },
          },

          React.createElement(Text, null, entry.id)
        )
      )
    );

  return {
    diaryLocalQueryKeys,

    runDiaryWriteOperation: (operation: () => Promise<unknown>) => operation(),

    getDiaryDayKey: (date: Date) => date.toISOString().slice(0, 10),

    useDiaryTransferState: () => ({
      type: null,

      phase: 'idle',

      processedEntries: 0,

      totalEntries: 0,

      processedPhotos: 0,

      totalPhotos: 0,
    }),

    useReadyDiaryDatabase: () => ({
      userId: 'user-1',

      repository: {
        markPendingDelete: (entryIds: ReadonlyArray<string>) =>
          mockMarkPendingDelete(entryIds),
      },
    }),

    DiaryLocalList,

    DiaryPhotoViewer: () => null,
  };
});

jest.mock('@shared/lib/navigation', () => ({
  useHeaderMenu: (items: HeaderMenuItem[]) => {
    mockHeaderMenuItems = items;
  },
}));

jest.mock('@features/create-diary-entry', () => ({
  CreateDiaryEntryModal: () => null,
}));

jest.mock('@features/edit-diary-entry', () => ({
  EditDiaryEntryModal: () => null,
}));

jest.mock('@features/filter-diary-entries', () => ({
  DiaryFiltersModal: () => null,
}));

jest.mock('@features/search-diary-entries', () => {
  const React = require('react');

  const { Text } = require('react-native');

  return {
    DiarySearch: () =>
      React.createElement(
        Text,
        {
          accessibilityLabel: 'diary-search',
        },
        'Diary search'
      ),
  };
});

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

jest.mock('@shared/lib/react', () => ({
  useCollapsibleToolbarVisibility: () => ({
    toolbarAnimatedStyle: {},

    listContentContainerStyle: {},

    handleToolbarLayout: mockHandleToolbarLayout,

    handleScroll: mockHandleToolbarScroll,

    handleScrollBeginDrag: mockHandleToolbarScrollBeginDrag,

    handleScrollEndDrag: mockHandleToolbarScrollEndDrag,

    showToolbar: mockShowToolbar,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');

  const { Pressable, Text, View } = require('react-native');

  const Button = ({
    accessibilityLabel,

    accessibilityState,

    disabled,

    onPress,

    children,
  }: {
    accessibilityLabel?: string;

    accessibilityState?: object;

    disabled?: boolean;

    onPress?: () => void;

    children?: unknown;
  }) =>
    React.createElement(
      Pressable,
      {
        accessibilityRole: 'button',

        accessibilityLabel,

        accessibilityState: {
          ...accessibilityState,

          disabled: Boolean(disabled),
        },

        disabled,

        onPress,
      },

      children
    );

  const IconButton = Button;

  const ConfirmDialog = ({
    visible,

    confirmLabel,

    confirmDisabled,

    onConfirm,
  }: {
    visible: boolean;

    confirmLabel: string;

    confirmDisabled?: boolean;

    onConfirm: () => void;
  }) => {
    if (!visible) {
      return null;
    }

    return React.createElement(
      View,
      null,

      React.createElement(
        Pressable,
        {
          accessibilityRole: 'button',

          accessibilityLabel: `confirm:${confirmLabel}`,

          disabled: confirmDisabled,

          onPress: onConfirm,
        },

        React.createElement(Text, null, confirmLabel)
      )
    );
  };

  return {
    Button,

    IconButton,

    ConfirmDialog,

    Spinner: () => null,
  };
});

jest.mock('../styles/OwnerDiary', () => {
  const { Text, View } = require('react-native');

  return {
    Root: View,

    ListArea: View,

    ToolbarOverlay: View,

    ToolbarArea: View,

    SyncProgress: View,

    SyncProgressText: Text,
  };
});

jest.mock('./OwnerDiarySelectionToolbar', () => {
  const React = require('react');

  const { Pressable, View } = require('react-native');

  return {
    OwnerDiarySelectionToolbar: ({
      selectedCount,

      allSelected,

      deleting,

      synchronizing,

      synchronizeDisabled,

      onToggleAll,

      onSynchronize,

      onDelete,

      onClose,
    }: {
      selectedCount: number;

      allSelected: boolean;

      deleting: boolean;

      synchronizing: boolean;

      synchronizeDisabled: boolean;

      onToggleAll: () => void;

      onSynchronize: () => void;

      onDelete: () => void;

      onClose: () => void;
    }) =>
      React.createElement(
        View,
        null,

        React.createElement(Pressable, {
          accessibilityRole: 'button',

          accessibilityLabel: allSelected
            ? 'diary.selection.clearAll'
            : 'diary.selection.selectAll',

          accessibilityState: {
            disabled: deleting || synchronizing,
          },

          disabled: deleting || synchronizing,

          onPress: onToggleAll,
        }),

        React.createElement(Pressable, {
          accessibilityRole: 'button',

          accessibilityLabel: 'diary.selection.synchronize',

          accessibilityState: {
            disabled: synchronizeDisabled,
          },

          disabled: synchronizeDisabled,

          onPress: onSynchronize,
        }),

        React.createElement(Pressable, {
          accessibilityRole: 'button',

          accessibilityLabel: 'diary.selection.delete',

          accessibilityState: {
            disabled: selectedCount === 0 || synchronizing,
          },

          disabled: selectedCount === 0 || synchronizing,

          onPress: onDelete,
        }),

        React.createElement(Pressable, {
          accessibilityRole: 'button',

          accessibilityLabel: 'diary.selection.close',

          accessibilityState: {
            disabled: deleting || synchronizing,
          },

          disabled: deleting || synchronizing,

          onPress: onClose,
        })
      ),
  };
});

jest.mock('./OwnerDiaryPreparationModal', () => ({
  OwnerDiaryPreparationModal: () => null,
}));

jest.mock('../model/useOwnerDiary', () => ({
  useOwnerDiary: () => ({
    list: {
      page: {
        items: mockEntries,

        pagination: {
          page: 1,

          pageSize: 30,

          totalItems: mockEntries.length,

          totalPages: 1,

          hasPreviousPage: false,

          hasNextPage: false,
        },
      },

      currentPage: 1,

      listItems: [],

      visibleEntryIds: new Set(mockEntries.map((entry) => entry.id)),

      collapsedDayKeys: new Set(),

      isInitialLoading: false,

      hasInitialError: false,

      isRefetching: false,

      isPaginationLoading: false,

      listRef: {
        current: null,
      },

      viewabilityConfig: {},

      handleViewableItemsChanged: jest.fn(),

      toggleDay: jest.fn(),

      handleChangePage: jest.fn(),

      handleRetry: jest.fn(),

      expandAllDays: mockExpandAllDays,

      collapseAllDays: mockCollapseAllDays,

      reconcileCurrentPage: mockReconcileCurrentPage,
    },

    search: {
      text: '',

      search: {
        field: 'comment',

        query: null,
      },

      setText: jest.fn(),

      applyText: jest.fn(),

      setField: jest.fn(),

      clear: jest.fn(),
    },

    filters: {
      visible: false,

      hasAppliedFilters: false,

      open: jest.fn(),

      apply: jest.fn(),
    },
  }),
}));

jest.mock('../model/useOwnerDiarySync', () => ({
  useOwnerDiarySync: () => ({
    connectionState: 'online',

    batchProgress: null,

    batchType: null,

    syncingEntryIds: new Set(['entry-syncing']),

    manualSyncPending: false,

    forcedSyncPending: false,

    preparingSavedEntry: null,

    isPreparingSavedEntry: false,

    isEntrySyncing: (entryId: string) => entryId === 'entry-syncing',

    handleEntrySaved: jest.fn(),

    handleEntriesMarkedForDeletion: mockHandleEntriesMarkedForDeletion,

    handleForcedSync: mockHandleForcedSync,

    handleManualSync: mockHandleManualSync,
  }),
}));

jest.mock('../model/useOwnerDiaryPreparation', () => ({
  useOwnerDiaryPreparation: () => ({
    preparingEntry: null,

    handleEntrySaved: jest.fn(),
  }),
}));

jest.mock('../model/useOwnerDiaryEntryEditor', () => ({
  useOwnerDiaryEntryEditor: () => ({
    createVisible: false,

    editingEntry: null,

    editVisible: false,

    isOpeningEdit: false,

    openCreate: mockOpenCreate,

    closeCreate: mockCloseCreate,

    openEdit: mockOpenEdit,

    closeEdit: mockCloseEdit,

    handleCreated: mockHandleCreated,

    handleUpdated: mockHandleUpdated,
  }),
}));

const getHeaderMenuItem = (key: string): HeaderMenuItem => {
  const item = mockHeaderMenuItems.find((candidate) => candidate.key === key);

  if (item === undefined) {
    throw new Error(`Header menu item not found: ${key}`);
  }

  return item;
};

describe('OwnerDiary integration', () => {
  let queryClient: QueryClient;

  const QueryProvider = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockHeaderMenuItems = [];

    mockMarkPendingDelete.mockReset();

    mockMarkPendingDelete.mockResolvedValue(undefined);

    mockHandleForcedSync.mockResolvedValue(true);

    mockHandleManualSync.mockResolvedValue(true);

    mockHandleEntriesMarkedForDeletion.mockResolvedValue(true);

    mockReconcileCurrentPage.mockResolvedValue(false);

    mockOpenEdit.mockResolvedValue(true);

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

  it('enters selection mode from header and force-syncs only available entries', async () => {
    const screen = render(<OwnerDiary />, {
      wrapper: QueryProvider,
    });

    expect(screen.getByLabelText('diary-search')).toBeTruthy();

    const selectEntriesItem = getHeaderMenuItem('diary-select-entries');

    expect(selectEntriesItem.disabled).toBe(false);

    act(() => {
      selectEntriesItem.onPress();
    });

    expect(screen.queryByLabelText('diary-search')).toBeNull();

    expect(mockExpandAllDays).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText('diary.selection.selectAll'));

    fireEvent.press(screen.getByLabelText('diary.selection.synchronize'));

    await waitFor(() => {
      expect(mockHandleForcedSync).toHaveBeenCalledWith(['entry-available']);
    });

    expect(screen.getByLabelText('diary-search')).toBeTruthy();

    await waitFor(() => {
      expect(mockReconcileCurrentPage).toHaveBeenCalledTimes(1);
    });
  });

  it('does not allow pendingDelete or synchronizing entries into selection', async () => {
    const screen = render(<OwnerDiary />, {
      wrapper: QueryProvider,
    });

    const selectEntriesItem = getHeaderMenuItem('diary-select-entries');

    act(() => {
      selectEntriesItem.onPress();
    });

    fireEvent.press(screen.getByLabelText('entry:entry-deleting'));

    fireEvent.press(screen.getByLabelText('entry:entry-syncing'));

    const synchronizeButton = screen.getByLabelText(
      'diary.selection.synchronize'
    );

    expect(synchronizeButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByLabelText('entry:entry-available'));

    await waitFor(() => {
      expect(
        screen.getByLabelText('diary.selection.synchronize').props
          .accessibilityState.disabled
      ).toBe(false);
    });

    fireEvent.press(screen.getByLabelText('diary.selection.synchronize'));

    await waitFor(() => {
      expect(mockHandleForcedSync).toHaveBeenCalledWith(['entry-available']);
    });
  });

  it('marks selected entries for deletion and continues through targeted deletion sync', async () => {
    const screen = render(<OwnerDiary />, {
      wrapper: QueryProvider,
    });

    const selectEntriesItem = getHeaderMenuItem('diary-select-entries');

    act(() => {
      selectEntriesItem.onPress();
    });

    fireEvent.press(screen.getByLabelText('entry:entry-available'));

    fireEvent.press(screen.getByLabelText('diary.selection.delete'));

    expect(
      screen.getByLabelText('confirm:diary.selection.delete')
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText('confirm:diary.selection.delete'));

    await waitFor(() => {
      expect(mockMarkPendingDelete).toHaveBeenCalledWith(['entry-available']);
    });

    await waitFor(() => {
      expect(mockHandleEntriesMarkedForDeletion).toHaveBeenCalledWith([
        'entry-available',
      ]);
    });

    await waitFor(() => {
      expect(mockReconcileCurrentPage).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByLabelText('diary-search')).toBeTruthy();
  });
});
