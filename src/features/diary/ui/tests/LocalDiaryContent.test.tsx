import { act } from 'react';
import { FlatList, Text } from 'react-native';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import type { DiaryEntry } from '../../model';
import { useDiaryListStore } from '../../model';
import DiaryEntryCard from '../DiaryEntryCard';
import LocalDiaryContent from '../LocalDiaryContent';

const mockFetchQuery = jest.fn();
const mockGetLocalPageOptions = jest.fn();
const mockUseDiaryPage = jest.fn();
const mockUseReadyDiaryDatabase = jest.fn();
const mockShowNotification = jest.fn();
const mockRefetch = jest.fn();

const mockTheme = {
  colors: {
    primary: '#0057ff',
    text: '#111111',
    muted: '#777777',
    success: '#008000',
    warning: '#ff9900',
  },
  spacing: {
    sm: 8,
    md: 12,
    xl: 20,
  },
  size: {
    md: 16,
  },
};

jest.mock('@features/shared/model/constants/environment', () => ({}));

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
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

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    fetchQuery: (...args: unknown[]) => mockFetchQuery(...args),
  }),
}));

jest.mock('@features/diary/api', () => ({
  diaryApi: {
    getLocalPageOptions: (...args: unknown[]) =>
      mockGetLocalPageOptions(...args),
  },
  useDiaryPage: (...args: unknown[]) => mockUseDiaryPage(...args),
  useReadyDiaryDatabase: () => mockUseReadyDiaryDatabase(),
}));

jest.mock('@features/shared/ui', () => {
  return {
    showNotification: (...args: unknown[]) => mockShowNotification(...args),
  };
});

jest.mock('@entities/shared/ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');

  return {
    LoadingView: ({ loading = true }: { loading?: boolean }) =>
      loading ? React.createElement(Text, null, 'loading') : null,

    ErrorSection: ({
      callback,
      error,
    }: {
      callback: () => void;
      error: string;
    }) =>
      React.createElement(
        Pressable,
        {
          accessibilityRole: 'button',
          accessibilityLabel: 'retry',
          onPress: callback,
        },
        React.createElement(Text, null, error)
      ),
  };
});

jest.mock('@features/shared/styles/global', () => {
  const emptyStyle = () => ({});

  return {
    Body: emptyStyle,
    Caption: emptyStyle,
    Divider: emptyStyle,
    IconButton: emptyStyle,
    Inset: emptyStyle,
    Rounded: emptyStyle,
    Row: emptyStyle,
    Stack: emptyStyle,
    Subheading: emptyStyle,
    Surface: emptyStyle,
    Text: emptyStyle,
    CenterContent: {},
    FlexItem: {},
  };
});

jest.mock('../../styles/DiaryEntryCard', () => ({
  Card: () => ({}),
  Header: () => ({}),
  MealRelation: () => ({}),
  Metrics: () => ({}),
  Metric: () => ({}),
  Status: () => ({}),
  Pressed: {},
}));

jest.mock('../DiaryTextPreview', () => {
  const React = jest.requireActual('react');
  const { Text, View } = jest.requireActual('react-native');

  const DiaryTextPreview = ({ title, text }: { title: string; text: string }) =>
    React.createElement(
      View,
      null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, text)
    );

  return {
    __esModule: true,
    default: DiaryTextPreview,
  };
});

jest.mock('../DiaryTextModal', () => ({
  __esModule: true,
  default: () => null,
}));

type TestPage = {
  items: DiaryEntry[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

let mockPages: Map<number, TestPage>;

let mockQueryFlags: {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isRefetching: boolean;
};

const mockRepository = {
  getPage: jest.fn(),
};

const makeEntry = (
  id: string,
  eventAt: Date,
  syncStatus:
    | 'synced'
    | 'pendingCreate'
    | 'pendingUpdate'
    | 'pendingDelete' = 'synced'
): DiaryEntry =>
  ({
    id,
    userId: 'user-1',
    eventAt,
    glucose: 6.2,
    shortInsulin: null,
    longInsulin: null,
    carbsGram: null,
    mealRelation: null,
    comment: `entry:${id}`,
    aiAnalysis: '',
    localPhotoUri: null,
    photoUrl: null,
    syncStatus,
    createdAt: eventAt,
    updatedAt: eventAt,
  }) as unknown as DiaryEntry;

const makePage = (
  page: number,
  totalPages: number,
  items: DiaryEntry[]
): TestPage => ({
  items,
  pagination: {
    page,
    pageSize: 30,
    totalItems: totalPages * 30,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  },
});

const renderContent = () =>
  render(
    <LocalDiaryContent
      renderEntry={(entry, isVisible) => (
        <DiaryEntryCard entry={entry} isVisible={isVisible} />
      )}
    />
  );

const getDayHeaders = () =>
  screen
    .getAllByRole('button')
    .filter((element) =>
      Object.prototype.hasOwnProperty.call(
        element.props.accessibilityState ?? {},
        'expanded'
      )
    );

describe('LocalDiaryContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPages = new Map();

    mockQueryFlags = {
      isLoading: false,
      isError: false,
      isFetching: false,
      isRefetching: false,
    };

    mockUseReadyDiaryDatabase.mockReturnValue({
      userId: 'user-1',
      repository: mockRepository,
    });

    mockUseDiaryPage.mockImplementation((page: number) => ({
      ...mockQueryFlags,
      data: mockPages.get(page),
      refetch: mockRefetch,
    }));

    mockGetLocalPageOptions.mockImplementation(({ page }) => ({
      queryKey: ['diary', 'local', 'user-1', page],
    }));

    mockFetchQuery.mockResolvedValue(undefined);

    useDiaryListStore.setState({
      currentPage: 1,
      collapsedDayKeys: new Set(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('groups entries by day and renders real diary cards', () => {
    mockPages.set(
      1,
      makePage(1, 1, [
        makeEntry('first', new Date(2026, 6, 19, 12, 0)),
        makeEntry('second', new Date(2026, 6, 19, 9, 30)),
        makeEntry('third', new Date(2026, 6, 18, 21, 0)),
      ])
    );

    renderContent();

    expect(getDayHeaders()).toHaveLength(2);

    expect(screen.getByText('entry:first')).toBeTruthy();
    expect(screen.getByText('entry:second')).toBeTruthy();
    expect(screen.getByText('entry:third')).toBeTruthy();

    expect(screen.getAllByText('diary.entry.sync.synced')).toHaveLength(3);
  });

  it('collapses and expands one day without removing its header', () => {
    mockPages.set(
      1,
      makePage(1, 1, [
        makeEntry('first', new Date(2026, 6, 19, 12, 0)),
        makeEntry('second', new Date(2026, 6, 19, 9, 30)),
      ])
    );

    renderContent();

    let header = getDayHeaders()[0];

    expect(header.props.accessibilityState).toEqual({
      expanded: true,
    });

    fireEvent.press(header);

    expect(screen.queryByText('entry:first')).toBeNull();
    expect(screen.queryByText('entry:second')).toBeNull();

    header = getDayHeaders()[0];

    expect(header).toBeTruthy();
    expect(header.props.accessibilityState).toEqual({
      expanded: false,
    });

    fireEvent.press(header);

    expect(screen.getByText('entry:first')).toBeTruthy();
    expect(screen.getByText('entry:second')).toBeTruthy();

    expect(getDayHeaders()[0].props.accessibilityState).toEqual({
      expanded: true,
    });
  });

  it('loads the next page and expands groups after navigation', async () => {
    const sharedDay = new Date(2026, 6, 19, 12, 0);

    mockPages.set(1, makePage(1, 2, [makeEntry('page-1-entry', sharedDay)]));

    mockPages.set(2, makePage(2, 2, [makeEntry('page-2-entry', sharedDay)]));

    mockFetchQuery.mockResolvedValue(mockPages.get(2));

    renderContent();

    fireEvent.press(getDayHeaders()[0]);

    expect(screen.queryByText('entry:page-1-entry')).toBeNull();

    fireEvent.press(screen.getByLabelText('diary.pagination.nextPage'));

    await waitFor(() => {
      expect(screen.getByText('entry:page-2-entry')).toBeTruthy();
    });

    expect(mockGetLocalPageOptions).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 2,
      repository: mockRepository,
    });

    expect(mockFetchQuery).toHaveBeenCalledWith({
      queryKey: ['diary', 'local', 'user-1', 2],
    });

    expect(useDiaryListStore.getState().currentPage).toBe(2);
    expect(useDiaryListStore.getState().collapsedDayKeys.size).toBe(0);
  });

  it('keeps the current page when loading the next page fails', async () => {
    mockPages.set(
      1,
      makePage(1, 2, [makeEntry('current-entry', new Date(2026, 6, 19, 12, 0))])
    );

    const error = new Error('Database failure');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockFetchQuery.mockRejectedValue(error);

    renderContent();

    fireEvent.press(screen.getByLabelText('diary.pagination.nextPage'));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        'error',
        'diary.list.loadFailed'
      );
    });

    expect(useDiaryListStore.getState().currentPage).toBe(1);
    expect(screen.getByText('entry:current-entry')).toBeTruthy();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to load diary page',
      error
    );

    consoleError.mockRestore();
  });

  it('renders loading, error and empty states', () => {
    mockQueryFlags.isLoading = true;

    const view = renderContent();

    expect(screen.getByText('loading')).toBeTruthy();

    mockQueryFlags = {
      isLoading: false,
      isError: true,
      isFetching: false,
      isRefetching: false,
    };

    view.rerender(
      <LocalDiaryContent
        renderEntry={(entry) => <DiaryEntryCard entry={entry} />}
      />
    );

    expect(screen.getByText('diary.list.loadFailed')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('retry'));

    expect(mockRefetch).toHaveBeenCalledTimes(1);

    mockQueryFlags.isError = false;
    mockPages.set(1, makePage(1, 0, []));

    view.rerender(
      <LocalDiaryContent
        renderEntry={(entry) => <DiaryEntryCard entry={entry} />}
      />
    );

    expect(screen.getByText('diary.list.empty.title')).toBeTruthy();
    expect(screen.getByText('diary.list.empty.description')).toBeTruthy();

    expect(screen.queryByLabelText('diary.pagination.nextPage')).toBeNull();
  });

  it('passes current entry visibility to renderEntry', () => {
    const entry = makeEntry('visible-entry', new Date(2026, 6, 19, 12, 0));

    mockPages.set(1, makePage(1, 1, [entry]));

    const renderEntry = jest.fn(
      (currentEntry: DiaryEntry, isVisible: boolean) => (
        <Text>{`${currentEntry.id}:${String(isVisible)}`}</Text>
      )
    );

    render(<LocalDiaryContent renderEntry={renderEntry} />);

    expect(screen.getByText('visible-entry:false')).toBeTruthy();

    const list = screen.UNSAFE_getByType(FlatList);

    const entryItem = list.props.data.find(
      (item: { type: string }) => item.type === 'entry'
    );

    expect(entryItem).toBeDefined();

    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [
          {
            item: entryItem,
            key: 'entry:visible-entry',
            index: 1,
            isViewable: true,
          },
        ],
      });
    });

    expect(screen.getByText('visible-entry:true')).toBeTruthy();

    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [],
      });
    });

    expect(screen.getByText('visible-entry:false')).toBeTruthy();
  });
});
