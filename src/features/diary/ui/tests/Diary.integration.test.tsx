import { StyleSheet } from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import Diary from '@pages/Diary';

import type { DiaryEntry } from '../../model/types';

const mockUseAuthData = jest.fn();
const mockFindById = jest.fn();
const mockUseDiaryPage = jest.fn();
const mockDeleteMutateAsync = jest.fn();
const mockUseHeaderMenu = jest.fn();
const mockExpandAllDays = jest.fn();

const mockQueueDiaryEntriesForSync = jest.fn();
const mockQueuePendingDiaryEntriesForSync = jest.fn();
const mockQueueForcedDiaryEntriesForSync = jest.fn();
const mockSetDiaryEntryPreparing = jest.fn();

const mockRepository = {
  findById: (...args: unknown[]) => mockFindById(...args),
};

let mockCurrentDiaryEntry: DiaryEntry;
let mockSyncingEntryIds: ReadonlySet<string> = new Set();
let mockBatchProgress: unknown = null;

const createDiaryEntry = (): DiaryEntry => ({
  id: 'entry-1',
  userId: 'user-1',
  glucose: null,
  mealRelation: null,
  shortInsulin: null,
  longInsulin: null,
  carbsGram: null,
  comment: '',
  aiAnalysis: '',
  localPhotoUri: null,
  photoPath: 'users/user-1/entry-1.jpg',
  photoUrl: 'https://example.com/entry-1.jpg',
  eventAt: new Date('2026-08-01T12:00:00.000Z'),
  syncStatus: 'synced',
});

const mockTheme = {
  colors: {
    text: '#111111',
    muted: '#777777',
    primary: '#ea580c',
    success: '#008000',
    warning: '#ff9900',
    white: '#ffffff',
    metrics: {
      glucose: {
        text: '#ff0000',
      },
      carbsGram: {
        text: '#00aa00',
      },
      shortInsulin: {
        text: '#0000ff',
      },
      longInsulin: {
        text: '#800080',
      },
    },
  },
  size: {
    base: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
};

type ChildrenProps = {
  children: ReactNode;
};

type LocalDiaryContentProps = {
  renderEntry: (entry: DiaryEntry, isVisible: boolean) => ReactElement;
  selectionMode?: boolean;
};

type DiaryEntryFormProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  entry: DiaryEntry | null;
  onClose: () => void;
  onSaved: (entryId: string) => void;
};

type PhotoViewerProps = {
  visible: boolean;
  sourceUri: string | null;
  onClose: () => void;
};

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      resolvedLanguage: 'en',
    },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('expo-image', () => {
  const React = jest.requireActual('react');
  const { View: NativeView } = jest.requireActual('react-native');

  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(NativeView, {
        ...props,
        testID: 'diary-entry-image',
      }),
  };
});

jest.mock('@features/auth/api', () => ({
  useAuthData: () => mockUseAuthData(),
}));

jest.mock('@features/auth/model', () => ({
  UserRole: {
    User: 'user',
    Follower: 'follower',
  },
}));

jest.mock('@features/diary/api', () => ({
  useDeleteDiaryEntries: () => ({
    mutateAsync: (...args: unknown[]) => mockDeleteMutateAsync(...args),
    isPending: false,
  }),

  useDiaryPage: (...args: unknown[]) => mockUseDiaryPage(...args),

  useReadyDiaryDatabase: () => ({
    userId: 'user-1',
    repository: mockRepository,
  }),

  queuePendingDiaryEntriesForSync: (...args: unknown[]) =>
    mockQueuePendingDiaryEntriesForSync(...args),

  queueForcedDiaryEntriesForSync: (...args: unknown[]) =>
    mockQueueForcedDiaryEntriesForSync(...args),
}));

jest.mock('../../api/diarySyncCoordinator', () => ({
  queueDiaryEntriesForSync: (...args: unknown[]) =>
    mockQueueDiaryEntriesForSync(...args),

  setDiaryEntryPreparing: (...args: unknown[]) =>
    mockSetDiaryEntryPreparing(...args),
}));

jest.mock('@features/diary/model', () => ({
  useDiaryListStore: (
    selector: (state: {
      currentPage: number;
      expandAllDays: typeof mockExpandAllDays;
    }) => unknown
  ) =>
    selector({
      currentPage: 1,
      expandAllDays: mockExpandAllDays,
    }),

  useDiarySyncStore: (
    selector: (state: {
      syncingEntryIds: ReadonlySet<string>;
      batchProgress: unknown;
    }) => unknown
  ) =>
    selector({
      syncingEntryIds: mockSyncingEntryIds,
      batchProgress: mockBatchProgress,
    }),
}));

jest.mock('@features/header/model', () => ({
  useHeaderMenu: (...args: unknown[]) => mockUseHeaderMenu(...args),
}));

jest.mock('@features/network/model', () => ({
  useNetwork: () => ({
    isOnline: true,
    isOffline: false,
  }),
}));

jest.mock('../../api/sqlite/DiaryDatabaseProvider', () => ({
  useReadyDiaryDatabase: () => ({
    userId: 'user-1',
    repository: mockRepository,
  }),
}));

jest.mock('@features/shared/model', () => ({
  PlatformOS: {
    WEB: false,
  },
  dateKit: {
    relativeDateTimeLabel: () => 'date',
  },
}));

jest.mock('@features/shared/ui', () => {
  const React = jest.requireActual('react');

  const {
    Pressable: NativePressable,
    Text: NativeText,
    View: NativeView,
  } = jest.requireActual('react-native');

  return {
    showNotification: jest.fn(),

    PhotoViewer: ({ visible, sourceUri, onClose }: PhotoViewerProps) =>
      React.createElement(
        NativeView,
        null,
        React.createElement(
          NativeText,
          {
            testID: 'viewer-state',
          },
          `${String(visible)}:${sourceUri ?? 'none'}`
        ),
        React.createElement(
          NativePressable,
          {
            accessibilityRole: 'button',
            accessibilityLabel: 'close-viewer',
            onPress: onClose,
          },
          React.createElement(NativeText, null, 'close')
        )
      ),
  };
});

jest.mock('@entities/layout/ui', () => {
  const React = jest.requireActual('react');

  return {
    PageWrapper: ({ children }: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@entities/shared/ui', () => {
  const React = jest.requireActual('react');

  const { Pressable: NativePressable, Text: NativeText } =
    jest.requireActual('react-native');

  return {
    ConfirmModal: ({
      handleConfirmation,
    }: {
      handleConfirmation: () => void;
    }) =>
      React.createElement(
        NativePressable,
        {
          accessibilityRole: 'button',
          accessibilityLabel: 'confirm-delete',
          onPress: handleConfirmation,
        },
        React.createElement(NativeText, null, 'confirm-delete')
      ),

    Loader: ({ children }: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),

    LoadingView: ({
      loading,
      children,
    }: ChildrenProps & {
      loading: boolean;
    }) =>
      loading
        ? React.createElement(NativeText, null, 'loading')
        : React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@features/diary/ui/DiaryTextModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@features/diary/ui', () => {
  const React = jest.requireActual('react');

  const {
    Pressable: NativePressable,
    Text: NativeText,
    View: NativeView,
  } = jest.requireActual('react-native');

  const DiaryEntryCard = jest.requireActual(
    '@features/diary/ui/DiaryEntryCard'
  ).default;

  const DiaryPhotoViewer = jest.requireActual(
    '@features/diary/ui/DiaryPhotoViewer'
  ).default;

  return {
    DiaryEntryCard,
    DiaryPhotoViewer,

    DiaryEntryForm: ({
      visible,
      mode,
      entry,
      onClose,
      onSaved,
    }: DiaryEntryFormProps) =>
      visible
        ? React.createElement(
            NativeView,
            {
              testID: 'diary-entry-form',
            },
            React.createElement(
              NativeText,
              {
                testID: 'diary-entry-form-state',
              },
              `${mode}:${entry?.id ?? 'none'}`
            ),
            React.createElement(
              NativePressable,
              {
                accessibilityRole: 'button',
                accessibilityLabel: 'close-entry-form',
                onPress: onClose,
              },
              React.createElement(NativeText, null, 'close')
            ),
            React.createElement(
              NativePressable,
              {
                accessibilityRole: 'button',
                accessibilityLabel: 'complete-entry-form',
                onPress: () => onSaved(entry?.id ?? 'created-entry-id'),
              },
              React.createElement(NativeText, null, 'create')
            )
          )
        : null,

    LocalDiaryContent: ({ renderEntry }: LocalDiaryContentProps) =>
      renderEntry(mockCurrentDiaryEntry, true),
  };
});

jest.mock('@features/diary/styles/Diary', () => ({
  OwnerContent: {},
  Toolbar: () => ({}),
  CreateButton: () => ({}),
  EntryState: (pendingDelete: boolean) => ({
    opacity: pendingDelete ? 0.5 : 1,
  }),
  SyncProgress: () => ({}),
  SelectionToolbar: () => ({}),
  SelectionCount: () => ({}),
  SelectionAction: () => ({}),
  SelectionActionText: () => ({}),
  CloseSelectionButton: () => ({}),
  SelectableEntry: () => ({}),
  SelectionIndicator: () => ({}),
  SelectionIndicatorSlot: {},
  SelectionCard: () => ({}),
  UnsupportedContent: () => ({}),
  CenteredText: {},
}));

jest.mock('@features/diary/styles/DiaryEntryCard', () => ({
  Card: (_theme: unknown, pendingDelete: boolean) => ({
    opacity: pendingDelete ? 0.5 : 1,
  }),
  Body: () => ({}),
  Header: () => ({}),
  Time: () => ({}),
  TimeText: () => ({}),
  MealRelation: () => ({}),
  MealRelationText: () => ({}),
  Metrics: () => ({}),
  Metric: () => ({}),
  MetricIcon: {},
  MetricValue: () => ({}),
  Status: () => ({}),
  Pressed: {},
}));

jest.mock('@features/diary/styles/DiaryEntryPhoto', () => ({
  Frame: () => ({}),
  Image: {},
  CenteredOverlay: () => ({}),
  FallbackText: () => ({}),
  Indicator: () => ({}),
  Pressed: {},
}));

jest.mock('@features/shared/styles/global', () => {
  const emptyStyle = () => ({});

  return {
    Body: emptyStyle,
    Caption: emptyStyle,
    Divider: emptyStyle,
    Heading: emptyStyle,
    Subheading: emptyStyle,
    Text: emptyStyle,
    Button: emptyStyle,
    FlexItem: {},
  };
});

describe('Diary integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSyncingEntryIds = new Set();
    mockBatchProgress = null;

    mockUseAuthData.mockReturnValue({
      authData: {
        role: 'user',
      },
      isAuthLoading: false,
    });

    mockFindById.mockResolvedValue(createDiaryEntry());

    mockCurrentDiaryEntry = createDiaryEntry();

    mockUseDiaryPage.mockReturnValue({
      data: {
        items: [mockCurrentDiaryEntry],
      },
    });

    mockDeleteMutateAsync.mockResolvedValue(['entry-1']);

    mockQueueDiaryEntriesForSync.mockResolvedValue([
      {
        entryId: 'entry-1',
        status: 'skipped',
      },
    ]);

    mockQueuePendingDiaryEntriesForSync.mockResolvedValue([]);

    mockQueueForcedDiaryEntriesForSync.mockResolvedValue([]);
  });

  it('passes visibility, opens cloud photo and closes viewer', () => {
    render(<Diary />);

    expect(screen.getByTestId('diary-entry-image').props.source).toBe(
      'https://example.com/entry-1.jpg'
    );

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'false:none'
    );

    fireEvent.press(
      screen.getByLabelText('diary.entry.photo.openAccessibilityLabel'),
      {
        stopPropagation: jest.fn(),
      }
    );

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'true:https://example.com/entry-1.jpg'
    );

    fireEvent.press(screen.getByLabelText('close-viewer'));

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'false:none'
    );
  });

  it('opens and closes the create form', () => {
    render(<Diary />);

    expect(screen.queryByTestId('diary-entry-form')).toBeNull();

    fireEvent.press(
      screen.getByLabelText('diary.form.openCreateAccessibilityLabel')
    );

    expect(screen.getByTestId('diary-entry-form')).toBeTruthy();

    expect(screen.getByTestId('diary-entry-form-state').props.children).toBe(
      'create:none'
    );

    fireEvent.press(screen.getByLabelText('close-entry-form'));

    expect(screen.queryByTestId('diary-entry-form')).toBeNull();
  });

  it('closes the create form after an entry is created', async () => {
    render(<Diary />);

    fireEvent.press(
      screen.getByLabelText('diary.form.openCreateAccessibilityLabel')
    );

    fireEvent.press(screen.getByLabelText('complete-entry-form'));

    expect(screen.queryByTestId('diary-entry-form')).toBeNull();

    expect(mockSetDiaryEntryPreparing).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'created-entry-id',
      preparing: false,
    });

    await waitFor(() => {
      expect(mockQueueDiaryEntriesForSync).toHaveBeenCalledWith({
        userId: 'user-1',
        entryIds: ['created-entry-id'],
        repository: mockRepository,
      });
    });
  });

  it('re-reads the entry from SQLite before opening edit mode', async () => {
    render(<Diary />);

    fireEvent.press(
      screen.getByLabelText('diary.entry.editAccessibilityLabel')
    );

    await waitFor(() => {
      expect(mockFindById).toHaveBeenCalledWith('entry-1');

      expect(screen.getByTestId('diary-entry-form-state').props.children).toBe(
        'edit:entry-1'
      );
    });
  });

  it('dims a pendingDelete entry and disables its actions', () => {
    mockCurrentDiaryEntry = {
      ...createDiaryEntry(),
      syncStatus: 'pendingDelete',
    };

    mockUseDiaryPage.mockReturnValue({
      data: {
        items: [mockCurrentDiaryEntry],
      },
    });

    render(<Diary />);

    const entryCard = screen.getByTestId('diary-entry-card-entry-1');

    expect(entryCard.props.accessibilityState).toEqual({
      disabled: true,
    });

    expect(entryCard.props.onPress).toBeUndefined();

    expect(StyleSheet.flatten(entryCard.props.style)).toEqual(
      expect.objectContaining({
        opacity: 0.5,
      })
    );

    expect(screen.getByText('diary.entry.sync.deleting')).toBeTruthy();

    expect(
      screen.queryByLabelText('diary.entry.photo.openAccessibilityLabel')
    ).toBeNull();

    fireEvent.press(entryCard);

    expect(mockFindById).not.toHaveBeenCalled();
  });

  it('selects an entry through the header menu and marks it for deletion', async () => {
    render(<Diary />);

    const headerItems = mockUseHeaderMenu.mock.calls.at(-1)?.[0] as Array<{
      key: string;
      onPress: () => void;
    }>;

    const selectEntriesItem = headerItems.find(
      (item) => item.key === 'diary-select-entries'
    );

    expect(selectEntriesItem).toBeDefined();

    act(() => {
      selectEntriesItem?.onPress();
    });

    expect(
      screen.queryByLabelText('diary.form.openCreateAccessibilityLabel')
    ).toBeNull();

    expect(mockExpandAllDays).toHaveBeenCalledTimes(1);

    fireEvent.press(
      screen.getByLabelText('diary.selection.entryAccessibilityLabel')
    );

    fireEvent.press(screen.getByLabelText('diary.selection.delete'));

    fireEvent.press(screen.getByLabelText('confirm-delete'));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith(['entry-1']);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText('diary.form.openCreateAccessibilityLabel')
      ).toBeTruthy();
    });
  });
});
