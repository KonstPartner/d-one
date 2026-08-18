import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { CloudDiaryEntry } from '@entities/diary';

import { OwnerCloudDiary } from './OwnerCloudDiary';

jest.mock('@features/screen-help', () => ({
  OwnerCloudDiaryHelp: () => null,
}));

const mockDownloadStart = jest.fn<
  Promise<void>,
  [readonly CloudDiaryEntry[]]
>();

const mockExitSelection = jest.fn();

const mockToggleAll = jest.fn();

const mockToggleEntry = jest.fn();

const mockEnterSelection = jest.fn();

const mockRefreshFirstPage = jest.fn<Promise<boolean>, []>();

const mockGoNext = jest.fn<Promise<boolean>, []>();

const mockGoPrevious = jest.fn<boolean, []>();

let mockDownloadStep:
  | 'idle'
  | 'checking'
  | 'strategy'
  | 'review'
  | 'processing'
  | 'result' = 'idle';

let mockSelectedEntries: readonly CloudDiaryEntry[] = [];

const createCloudEntry = (id: string): CloudDiaryEntry => ({
  id,

  userId: 'user-1',

  glucose: 6.5,

  mealRelation: null,

  shortInsulin: null,

  ultraShortInsulin: null,

  longInsulin: null,

  carbsGram: null,

  comment: `Entry ${id}`,

  aiAnalysis: '',

  photoPath: null,

  photoUrl: null,

  eventAt: new Date('2026-08-14T12:00:00.000Z'),
});

const mockEntryOne = createCloudEntry('entry-1');

const mockEntryTwo = createCloudEntry('entry-2');

jest.mock('@features/download-cloud-diary-entries', () => ({
  useCloudDiaryDownloadFlow: () => ({
    step: mockDownloadStep,

    isChecking: mockDownloadStep === 'checking',

    isProcessing: mockDownloadStep === 'processing',

    start: mockDownloadStart,
  }),

  CloudDiaryDownloadModal: () => null,
}));

jest.mock('@entities/diary', () => ({
  useDiaryTransferState: () => ({
    type: null,

    phase: 'idle',

    processedEntries: 0,

    totalEntries: 0,

    processedPhotos: 0,

    totalPhotos: 0,
  }),

  CloudDiaryList: () => null,

  CloudDiaryPhotoViewer: () => null,
}));

jest.mock('@entities/session', () => ({
  useSession: () => ({
    isSessionReady: true,

    sessionUser: {
      uid: 'user-1',
    },
  }),
}));

jest.mock('../model/useOwnerCloudDiary', () => ({
  useOwnerCloudDiary: () => ({
    page: {
      items: [mockEntryOne, mockEntryTwo],
    },

    listItems: [],

    visibleEntryIds: new Set(),

    collapsedDayKeys: new Set(),

    listRef: {
      current: null,
    },

    getListItemKey: jest.fn(),

    viewabilityConfig: {},

    handleViewableItemsChanged: jest.fn(),

    hasPreviousPage: false,

    hasNextPage: false,

    goPrevious: mockGoPrevious,

    goNext: mockGoNext,

    refreshFirstPage: mockRefreshFirstPage,

    error: null,

    isInitialLoading: false,

    hasInitialError: false,

    isLoading: false,

    selection: {
      selectionMode: true,

      selectedEntryIds: new Set(mockSelectedEntries.map((entry) => entry.id)),

      selectedEntries: mockSelectedEntries,

      selectedCount: mockSelectedEntries.length,

      allSelected: mockSelectedEntries.length === 2,

      canEnterSelection: true,

      enterSelection: mockEnterSelection,

      exitSelection: mockExitSelection,

      toggleEntry: mockToggleEntry,

      toggleAll: mockToggleAll,

      isEntrySelected: (entry: CloudDiaryEntry) =>
        mockSelectedEntries.some(
          (selectedEntry) => selectedEntry.id === entry.id
        ),
    },
  }),
}));

jest.mock('./OwnerCloudDiarySelectionToolbar', () => {
  const React = require('react');

  const { Pressable, Text } = require('react-native');

  return {
    OwnerCloudDiarySelectionToolbar: ({
      downloadDisabled,
      downloading,
      onDownload,
    }: {
      downloadDisabled: boolean;

      downloading: boolean;

      onDownload: () => void;
    }) =>
      React.createElement(
        Pressable,
        {
          accessibilityRole: 'button',

          accessibilityLabel: 'download-selected',

          accessibilityState: {
            disabled: downloadDisabled,

            busy: downloading,
          },

          disabled: downloadDisabled,

          onPress: onDownload,
        },

        React.createElement(Text, null, 'Download')
      ),
  };
});

jest.mock('@shared/lib/navigation', () => ({
  useHeaderMenu: jest.fn(),
}));

jest.mock('@shared/lib/notifications', () => ({
  showNotification: jest.fn(),
}));

jest.mock('@shared/lib/errors', () => ({
  errorMapper: jest.fn(() => 'error'),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@shared/ui', () => ({
  Loader: ({ children }: { children?: unknown }) => children,

  LoadingView: () => null,
}));

describe('OwnerCloudDiary integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDownloadStep = 'idle';

    mockSelectedEntries = [];

    mockDownloadStart.mockResolvedValue();

    mockRefreshFirstPage.mockResolvedValue(true);

    mockGoNext.mockResolvedValue(true);

    mockGoPrevious.mockReturnValue(true);
  });

  it('downloads exactly the selected entries from the current cloud page', async () => {
    mockSelectedEntries = [mockEntryOne, mockEntryTwo];

    const screen = render(<OwnerCloudDiary />);

    fireEvent.press(screen.getByLabelText('download-selected'));

    await waitFor(() => {
      expect(mockDownloadStart).toHaveBeenCalledTimes(1);
    });

    expect(mockDownloadStart).toHaveBeenCalledWith([
      mockEntryOne,
      mockEntryTwo,
    ]);

    expect(mockDownloadStart.mock.calls[0]?.[0]?.[0]).toBe(mockEntryOne);

    expect(mockDownloadStart.mock.calls[0]?.[0]?.[1]).toBe(mockEntryTwo);
  });

  it('does not allow download when no entries are selected', () => {
    mockSelectedEntries = [];

    const screen = render(<OwnerCloudDiary />);

    const downloadButton = screen.getByLabelText('download-selected');

    expect(downloadButton.props.accessibilityState).toEqual(
      expect.objectContaining({
        disabled: true,
      })
    );

    fireEvent.press(downloadButton);

    expect(mockDownloadStart).not.toHaveBeenCalled();
  });

  it('exits selection mode when download reaches the result step', async () => {
    mockSelectedEntries = [mockEntryOne];

    mockDownloadStep = 'result';

    render(<OwnerCloudDiary />);

    await waitFor(() => {
      expect(mockExitSelection).toHaveBeenCalledTimes(1);
    });
  });

  it('does not start a second download while another download is active', () => {
    mockSelectedEntries = [mockEntryOne];

    mockDownloadStep = 'processing';

    const screen = render(<OwnerCloudDiary />);

    const downloadButton = screen.getByLabelText('download-selected');

    expect(downloadButton.props.accessibilityState).toEqual(
      expect.objectContaining({
        disabled: true,

        busy: true,
      })
    );

    fireEvent.press(downloadButton);

    expect(mockDownloadStart).not.toHaveBeenCalled();
  });
});
