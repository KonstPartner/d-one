import { type PropsWithChildren, useState } from 'react';
import { Alert, type AlertButton, Pressable } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { collection, doc } from 'firebase/firestore';
import { Host } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { lightTheme } from '@features/theme/model';

import {
  createDiaryPhotoDraft,
  DiaryPhotoError,
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
  removeDiaryPhotoDraft,
} from '../../api/diaryPhotoService';
import {
  closeDiaryDatabase,
  openDiaryDatabase,
} from '../../api/sqlite/diaryDatabase';
import { DiaryDatabaseOperationGate } from '../../api/sqlite/diaryDatabaseOperationGate';
import {
  DiaryDatabaseProvider,
  useDiaryDatabase,
} from '../../api/sqlite/DiaryDatabaseProvider';
import { DiaryRepository } from '../../api/sqlite/diaryRepository';
import { useDiaryListStore } from '../../model/store';
import type { DiaryEntry, DiaryEntryFormMode } from '../../model/types';
import DiaryEntryForm from '../DiaryEntryForm';

const CURRENT_DATE = new Date('2026-08-03T10:15:00.000Z');
const SOURCE_PHOTO_URI = 'file:///source-photo.jpg';
const DRAFT_PHOTO_URI = 'file:///diary-photo-draft.jpg';
const NEXT_DRAFT_PHOTO_URI = 'file:///next-diary-photo-draft.jpg';
const SAVED_PHOTO_URI = 'file:///users/user-1/diaryPhotos/entry-created.jpg';
const SAVED_PHOTO_PATH = 'users/user-1/diaryPhotos/entry-created.jpg';
const EXISTING_PHOTO_URI = 'file:///users/user-1/diaryPhotos/entry-1.jpg';
const EXISTING_PHOTO_PATH = 'users/user-1/diaryPhotos/entry-1.jpg';

const mockPickImage = jest.fn();
const mockTakeImage = jest.fn();
const mockFinalizePhoto = jest.fn();
const mockRollbackPhoto = jest.fn();
const mockFinalizeRemoval = jest.fn();
const mockRollbackRemoval = jest.fn();

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

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('@features/shared/model/hooks/useImagePicker', () => ({
  __esModule: true,
  default: () => ({
    pickImage: (...args: unknown[]) => mockPickImage(...args),
    takeImage: (...args: unknown[]) => mockTakeImage(...args),
    isPicking: false,
  }),
}));

jest.mock('../../api/diaryPhotoService', () => {
  class MockDiaryPhotoError extends Error {
    public readonly code: string;

    public constructor(mockErrorCode: string) {
      super(mockErrorCode);
      this.code = mockErrorCode;
      this.name = 'DiaryPhotoError';
    }
  }

  return {
    DiaryPhotoError: MockDiaryPhotoError,
    createDiaryPhotoDraft: jest.fn(),
    prepareDiaryPhotoForEntry: jest.fn(),
    prepareDiaryPhotoRemoval: jest.fn(),
    removeDiaryPhotoDraft: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@features/auth/api/firebase/config', () => ({
  db: {},
}));

jest.mock('../../api/sqlite/diaryDatabase', () => ({
  openDiaryDatabase: jest.fn(),
  closeDiaryDatabase: jest.fn(),
}));

jest.mock('@features/shared/model/constants/environment', () => ({
  __esModule: true,
  envConfig: {
    publicAppUrl: 'https://example.com',
  },
}));

const mockedCollection = jest.mocked(collection);
const mockedDoc = jest.mocked(doc);
const mockedCreateDiaryPhotoDraft = jest.mocked(createDiaryPhotoDraft);
const mockedPrepareDiaryPhotoForEntry = jest.mocked(prepareDiaryPhotoForEntry);
const mockedPrepareDiaryPhotoRemoval = jest.mocked(prepareDiaryPhotoRemoval);
const mockedRemoveDiaryPhotoDraft = jest.mocked(removeDiaryPhotoDraft);
const mockedOpenDiaryDatabase = jest.mocked(openDiaryDatabase);
const mockedCloseDiaryDatabase = jest.mocked(closeDiaryDatabase);

const existingEntry: DiaryEntry = {
  id: 'entry-1',
  userId: 'user-1',
  glucose: 7.2,
  mealRelation: 'afterMeal',
  shortInsulin: 3,
  longInsulin: null,
  carbsGram: 45,
  comment: 'Dinner',
  aiAnalysis: 'Existing analysis',
  localPhotoUri: EXISTING_PHOTO_URI,
  photoPath: EXISTING_PHOTO_PATH,
  photoUrl: 'https://example.com/entry-1.jpg',
  eventAt: new Date('2026-08-01T18:30:00.000Z'),
  syncStatus: 'synced',
};

const existingEntryRow = {
  id: existingEntry.id,
  user_id: existingEntry.userId,
  glucose: existingEntry.glucose,
  meal_relation: existingEntry.mealRelation,
  short_insulin: existingEntry.shortInsulin,
  long_insulin: existingEntry.longInsulin,
  carbs_gram: existingEntry.carbsGram,
  comment: existingEntry.comment,
  ai_analysis: existingEntry.aiAnalysis,
  local_photo_uri: existingEntry.localPhotoUri,
  photo_path: existingEntry.photoPath,
  photo_url: existingEntry.photoUrl,
  event_at: existingEntry.eventAt.getTime(),
  sync_status: existingEntry.syncStatus,
};

type ReadyFormProps = {
  mode: DiaryEntryFormMode;
  entry: DiaryEntry | null;
  onClose: () => void;
  onSaved: (entryId: string) => void;
};

const ReadyForm = ({ mode, entry, onClose, onSaved }: ReadyFormProps) => {
  const database = useDiaryDatabase();
  const [visible, setVisible] = useState(true);

  if (database.status !== 'ready') {
    return null;
  }

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleSaved = (entryId: string) => {
    setVisible(false);
    onSaved(entryId);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="open-diary-form"
        onPress={() => setVisible(true)}
      />

      <DiaryEntryForm
        visible={visible}
        mode={mode}
        entry={entry}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </>
  );
};

let queryClient: QueryClient;

const TestProviders = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={lightTheme}>
      <SafeAreaProvider
        initialMetrics={{
          frame: {
            x: 0,
            y: 0,
            width: 390,
            height: 844,
          },
          insets: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        }}
      >
        <Host>{children}</Host>
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

let alertSpy: jest.SpyInstance;
let runAsync: jest.Mock;
let getFirstAsync: jest.Mock;
let repository: DiaryRepository;

const renderForm = ({
  mode = 'create',
  entry = null,
}: {
  mode?: DiaryEntryFormMode;
  entry?: DiaryEntry | null;
} = {}) => {
  const onClose = jest.fn();
  const onSaved = jest.fn();

  render(
    <TestProviders>
      <DiaryDatabaseProvider userId="user-1">
        <ReadyForm
          mode={mode}
          entry={entry}
          onClose={onClose}
          onSaved={onSaved}
        />
      </DiaryDatabaseProvider>
    </TestProviders>
  );

  return {
    onClose,
    onSaved,
  };
};

const pressLastAlertButton = (label: string): void => {
  const calls = alertSpy.mock.calls;
  const buttons = calls[calls.length - 1]?.[2] as AlertButton[] | undefined;
  const button = buttons?.find(({ text }) => text === label);

  if (button === undefined) {
    throw new Error(`Alert button was not found: ${label}`);
  }

  act(() => {
    button.onPress?.();
  });
};

const choosePhotoFromGallery = async (
  actionAccessibilityLabel: string
): Promise<void> => {
  fireEvent.press(await screen.findByLabelText(actionAccessibilityLabel));

  expect(alertSpy).toHaveBeenLastCalledWith(
    'diary.form.photo.sourceTitle',
    'diary.form.photo.sourceMessage',
    expect.any(Array)
  );

  const draftCreationCallsBeforeSelection =
    mockedCreateDiaryPhotoDraft.mock.calls.length;

  pressLastAlertButton('diary.form.photo.gallery');

  await waitFor(() => {
    expect(mockedCreateDiaryPhotoDraft).toHaveBeenCalledTimes(
      draftCreationCallsBeforeSelection + 1
    );

    const submitButton =
      screen.queryByLabelText('diary.form.save') ??
      screen.getByLabelText('diary.form.create');

    expect(
      submitButton.props.disabled === true ||
        submitButton.props.accessibilityState?.disabled === true
    ).toBe(false);
  });
};

describe('DiaryEntryForm photo integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(CURRENT_DATE);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    runAsync = jest.fn().mockResolvedValue({
      changes: 1,
      lastInsertRowId: 1,
    });
    getFirstAsync = jest.fn().mockResolvedValue(existingEntryRow);

    repository = new DiaryRepository(
      {
        runAsync,
        getFirstAsync,
      } as unknown as SQLiteDatabase,
      'user-1',
      new DiaryDatabaseOperationGate()
    );

    mockedCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockedDoc.mockReturnValue({
      id: 'entry-created',
    } as ReturnType<typeof doc>);

    mockedOpenDiaryDatabase.mockResolvedValue(repository);
    mockedCloseDiaryDatabase.mockResolvedValue(undefined);

    mockPickImage.mockResolvedValue(SOURCE_PHOTO_URI);
    mockTakeImage.mockResolvedValue(SOURCE_PHOTO_URI);
    mockedCreateDiaryPhotoDraft.mockResolvedValue({
      uri: DRAFT_PHOTO_URI,
      width: 1280,
      height: 720,
      size: 250_000,
    });
    mockedPrepareDiaryPhotoForEntry.mockReturnValue({
      localPhotoUri: SAVED_PHOTO_URI,
      photoPath: SAVED_PHOTO_PATH,
      finalize: mockFinalizePhoto,
      rollback: mockRollbackPhoto,
    });
    mockedPrepareDiaryPhotoRemoval.mockReturnValue({
      finalize: mockFinalizeRemoval,
      rollback: mockRollbackRemoval,
    });

    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    useDiaryListStore.setState({
      currentPage: 3,
      collapsedDayKeys: new Set(['2026-08-02']),
    });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('creates an entry that contains only a photo', async () => {
    const { onSaved } = renderForm();

    await choosePhotoFromGallery('diary.form.photo.addAccessibilityLabel');

    fireEvent.press(screen.getByLabelText('diary.form.create'));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith('entry-created');
    });

    expect(mockPickImage).toHaveBeenCalledTimes(1);
    expect(mockedCreateDiaryPhotoDraft).toHaveBeenCalledWith(SOURCE_PHOTO_URI);
    expect(mockedPrepareDiaryPhotoForEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'entry-created',
      draftUri: DRAFT_PHOTO_URI,
    });

    const [sql, parameters] = runAsync.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];

    expect(sql).toContain('INSERT INTO diary_entries');
    expect(parameters).toEqual(
      expect.objectContaining({
        $id: 'entry-created',
        $userId: 'user-1',
        $localPhotoUri: SAVED_PHOTO_URI,
        $photoPath: SAVED_PHOTO_PATH,
        $photoUrl: null,
        $syncStatus: 'pendingCreate',
      })
    );
    expect(mockFinalizePhoto).toHaveBeenCalledTimes(1);
    expect(mockRollbackPhoto).not.toHaveBeenCalled();
    expect(mockedRemoveDiaryPhotoDraft).not.toHaveBeenCalled();
  });

  it('warns before closing, deletes only the photo and keeps other draft fields', async () => {
    const { onClose } = renderForm();

    fireEvent.changeText(
      await screen.findByLabelText('diary.form.commentAccessibilityLabel'),
      'Draft dinner'
    );
    await choosePhotoFromGallery('diary.form.photo.addAccessibilityLabel');

    fireEvent.press(
      screen.getByLabelText('diary.form.cancelAccessibilityLabel')
    );

    expect(alertSpy).toHaveBeenLastCalledWith(
      'diary.form.photo.discardTitle',
      'diary.form.photo.discardMessage',
      expect.any(Array)
    );
    expect(onClose).not.toHaveBeenCalled();

    pressLastAlertButton('common.cancel');

    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText('diary.form.photo.replaceAccessibilityLabel')
    ).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText('diary.form.cancelAccessibilityLabel')
    );
    pressLastAlertButton('diary.form.photo.discard');

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(mockedRemoveDiaryPhotoDraft).toHaveBeenCalledWith(DRAFT_PHOTO_URI);
    expect(
      screen.queryByLabelText('diary.form.commentAccessibilityLabel')
    ).toBeNull();

    fireEvent.press(screen.getByLabelText('open-diary-form'));

    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('Draft dinner');
    expect(
      screen.getByLabelText('diary.form.photo.addAccessibilityLabel')
    ).toBeTruthy();
  });

  it('shows the mapped photo error and keeps the form open', async () => {
    mockedCreateDiaryPhotoDraft.mockRejectedValueOnce(
      new DiaryPhotoError('fileTooLarge')
    );

    const { onClose, onSaved } = renderForm();

    fireEvent.press(
      await screen.findByLabelText('diary.form.photo.addAccessibilityLabel')
    );
    pressLastAlertButton('diary.form.photo.gallery');

    expect(
      await screen.findByText('diary.form.photo.errors.fileTooLarge')
    ).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(mockedPrepareDiaryPhotoForEntry).not.toHaveBeenCalled();
  });

  it('replaces an existing photo in edit mode', async () => {
    mockedPrepareDiaryPhotoForEntry.mockReturnValueOnce({
      localPhotoUri: EXISTING_PHOTO_URI,
      photoPath: EXISTING_PHOTO_PATH,
      finalize: mockFinalizePhoto,
      rollback: mockRollbackPhoto,
    });

    const { onSaved } = renderForm({
      mode: 'edit',
      entry: existingEntry,
    });

    await choosePhotoFromGallery('diary.form.photo.replaceAccessibilityLabel');
    fireEvent.press(screen.getByLabelText('diary.form.save'));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith('entry-1');
    });

    expect(mockedPrepareDiaryPhotoForEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'entry-1',
      draftUri: DRAFT_PHOTO_URI,
    });

    const [sql, parameters] = runAsync.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];

    expect(sql).toContain('UPDATE diary_entries');
    expect(parameters).toEqual(
      expect.objectContaining({
        $id: 'entry-1',
        $localPhotoUri: EXISTING_PHOTO_URI,
        $photoPath: EXISTING_PHOTO_PATH,
        $photoUrl: null,
      })
    );
    expect(mockFinalizePhoto).toHaveBeenCalledTimes(1);
    expect(mockRollbackPhoto).not.toHaveBeenCalled();
    expect(mockedPrepareDiaryPhotoRemoval).not.toHaveBeenCalled();
  });

  it('deletes an existing photo in edit mode', async () => {
    const { onSaved } = renderForm({
      mode: 'edit',
      entry: existingEntry,
    });

    fireEvent.press(
      await screen.findByLabelText('diary.form.photo.deleteAccessibilityLabel')
    );

    expect(
      screen.getByLabelText('diary.form.photo.addAccessibilityLabel')
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText('diary.form.save'));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith('entry-1');
    });

    expect(mockedPrepareDiaryPhotoRemoval).toHaveBeenCalledWith({
      userId: 'user-1',
      entryId: 'entry-1',
    });

    const [sql, parameters] = runAsync.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];

    expect(sql).toContain('UPDATE diary_entries');
    expect(parameters).toEqual(
      expect.objectContaining({
        $id: 'entry-1',
        $localPhotoUri: null,
        $photoPath: EXISTING_PHOTO_PATH,
        $photoUrl: null,
      })
    );
    expect(mockFinalizeRemoval).toHaveBeenCalledTimes(1);
    expect(mockRollbackRemoval).not.toHaveBeenCalled();
    expect(mockedPrepareDiaryPhotoForEntry).not.toHaveBeenCalled();
  });

  it('cleans a new temporary file when replacing the previous draft fails', async () => {
    mockedCreateDiaryPhotoDraft
      .mockResolvedValueOnce({
        uri: DRAFT_PHOTO_URI,
        width: 1280,
        height: 720,
        size: 250_000,
      })
      .mockResolvedValueOnce({
        uri: NEXT_DRAFT_PHOTO_URI,
        width: 1280,
        height: 720,
        size: 260_000,
      });
    mockedRemoveDiaryPhotoDraft.mockImplementation((uri) => {
      if (uri === DRAFT_PHOTO_URI) {
        throw new DiaryPhotoError('storageFailed');
      }
    });

    renderForm();

    await choosePhotoFromGallery('diary.form.photo.addAccessibilityLabel');
    await choosePhotoFromGallery('diary.form.photo.replaceAccessibilityLabel');

    await waitFor(() => {
      expect(mockedRemoveDiaryPhotoDraft).toHaveBeenCalledWith(
        NEXT_DRAFT_PHOTO_URI
      );
    });

    expect(mockedRemoveDiaryPhotoDraft).toHaveBeenNthCalledWith(
      1,
      DRAFT_PHOTO_URI
    );
    expect(mockedRemoveDiaryPhotoDraft).toHaveBeenNthCalledWith(
      2,
      NEXT_DRAFT_PHOTO_URI
    );
    expect(
      screen.getByText('diary.form.photo.errors.storageFailed')
    ).toBeTruthy();
    expect(
      screen.getByLabelText('diary.form.photo.replaceAccessibilityLabel')
    ).toBeTruthy();
  });
});
