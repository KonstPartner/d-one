import { type PropsWithChildren, useState } from 'react';
import { Pressable } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
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

import { diaryQueryKeys } from '../../api/constants';
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

const CURRENT_DATE = new Date('2026-08-02T10:15:00.000Z');

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
const mockedOpenDiaryDatabase = jest.mocked(openDiaryDatabase);
const mockedCloseDiaryDatabase = jest.mocked(closeDiaryDatabase);

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
        accessibilityLabel="open-create-form"
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

let queryClient: QueryClient;
let runAsync: jest.Mock;
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

describe('DiaryEntryForm integration', () => {
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

    repository = new DiaryRepository(
      {
        runAsync,
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

    useDiaryListStore.setState({
      currentPage: 3,
      collapsedDayKeys: new Set(['2026-08-01']),
    });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('rejects an empty entry without writing to SQLite', async () => {
    const { onSaved } = renderForm();

    fireEvent.press(await screen.findByLabelText('diary.form.create'));

    expect(
      await screen.findByText('diary.form.errors.emptyEntry')
    ).toBeTruthy();

    expect(runAsync).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('keeps form scrolling enabled and allows dropdown selection', async () => {
    renderForm();

    fireEvent.press(
      await screen.findByText('diary.form.mealRelationPlaceholder')
    );

    const formScroll = screen.getByTestId('diary-entry-form-scroll');

    expect(formScroll.props.scrollEnabled).toBeUndefined();
    expect(screen.getByTestId('select-dropdown-options')).toBeTruthy();

    fireEvent.press(screen.getByText('diary.entry.mealRelation.afterMeal'));

    expect(screen.queryByTestId('select-dropdown-options')).toBeNull();
    expect(screen.getByText('diary.entry.mealRelation.afterMeal')).toBeTruthy();
  });

  it('keeps the draft after closing and reopening the form', async () => {
    const { onClose } = renderForm();

    fireEvent.changeText(
      await screen.findByLabelText('diary.form.commentAccessibilityLabel'),
      'Draft dinner'
    );

    fireEvent.press(
      screen.getByLabelText('diary.form.cancelAccessibilityLabel')
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByLabelText('diary.form.commentAccessibilityLabel')
    ).toBeNull();

    fireEvent.press(screen.getByLabelText('open-create-form'));

    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('Draft dinner');
  });

  it('keeps the form open and shows an error when SQLite fails', async () => {
    const error = new Error('SQLite write failed');

    runAsync.mockRejectedValueOnce(error);

    const { onClose, onSaved } = renderForm();

    const commentInput = await screen.findByLabelText(
      'diary.form.commentAccessibilityLabel'
    );

    fireEvent.changeText(commentInput, '  Dinner  ');
    fireEvent.press(screen.getByLabelText('diary.form.create'));

    expect(
      await screen.findByText('diary.form.errors.creationFailed')
    ).toBeTruthy();

    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('  Dinner  ');

    fireEvent.press(
      screen.getByLabelText('diary.form.cancelAccessibilityLabel')
    );
    fireEvent.press(screen.getByLabelText('open-create-form'));

    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('  Dinner  ');
  });

  it('loads edit values and saves the update through SQLite', async () => {
    const entry: DiaryEntry = {
      id: 'entry-1',
      userId: 'user-1',
      glucose: 7.2,
      mealRelation: 'afterMeal',
      shortInsulin: 3,
      longInsulin: null,
      carbsGram: 45,
      comment: 'Dinner',
      aiAnalysis: 'Existing analysis',
      localPhotoUri: 'file:///entry-1.jpg',
      photoPath: 'users/user-1/entry-1.jpg',
      photoUrl: 'https://example.com/entry-1.jpg',
      eventAt: new Date('2026-08-01T18:30:00.000Z'),
      syncStatus: 'synced',
    };
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { onSaved } = renderForm({
      mode: 'edit',
      entry,
    });

    expect(await screen.findByText('diary.form.editTitle')).toBeTruthy();
    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('Dinner');

    fireEvent.changeText(
      screen.getByLabelText('diary.form.commentAccessibilityLabel'),
      '  Updated dinner  '
    );
    fireEvent.press(screen.getByLabelText('diary.form.save'));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith('entry-1');
    });

    expect(runAsync).toHaveBeenCalledTimes(1);

    const [sql, parameters] = runAsync.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];

    expect(sql).toContain('UPDATE diary_entries');
    expect(parameters).toEqual({
      $id: 'entry-1',
      $userId: 'user-1',
      $glucose: 7.2,
      $mealRelation: 'afterMeal',
      $shortInsulin: 3,
      $longInsulin: null,
      $carbsGram: 45,
      $comment: 'Updated dinner',
      $eventAt: entry.eventAt.getTime(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: diaryQueryKeys.localPagesRoot('user-1'),
    });
  });
});
