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
import type { PropsWithChildren } from 'react';
import { Host } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { db } from '@features/auth/api/firebase/config';
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
import CreateDiaryEntryForm from '../CreateDiaryEntryForm';

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
  onClose: () => void;
  onCreated: (entryId: string) => void;
};

const ReadyForm = ({ onClose, onCreated }: ReadyFormProps) => {
  const database = useDiaryDatabase();

  if (database.status !== 'ready') {
    return null;
  }

  return <CreateDiaryEntryForm onClose={onClose} onCreated={onCreated} />;
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

const renderForm = () => {
  const onClose = jest.fn();
  const onCreated = jest.fn();

  render(
    <TestProviders>
      <DiaryDatabaseProvider userId="user-1">
        <ReadyForm onClose={onClose} onCreated={onCreated} />
      </DiaryDatabaseProvider>
    </TestProviders>
  );

  return {
    onClose,
    onCreated,
  };
};

describe('CreateDiaryEntryForm integration', () => {
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
    const { onCreated } = renderForm();

    fireEvent.press(await screen.findByLabelText('diary.form.create'));

    expect(
      await screen.findByText('diary.form.errors.emptyEntry')
    ).toBeTruthy();

    expect(runAsync).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('normalizes and saves the entry as pendingCreate', async () => {
    const earliestEventAt = CURRENT_DATE.getTime();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { onCreated } = renderForm();

    fireEvent.changeText(
      await screen.findByLabelText('diary.form.commentAccessibilityLabel'),
      '  Dinner  '
    );

    fireEvent.press(screen.getByLabelText('diary.form.create'));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith('entry-created');
    });

    const latestEventAt = Date.now();

    expect(onCreated).toHaveBeenCalledTimes(1);

    expect(mockedCollection).toHaveBeenCalledWith(
      db,
      'users',
      'user-1',
      'diaryEntries'
    );

    expect(mockedDoc).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenCalledTimes(1);

    const [sql, parameters] = runAsync.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];

    expect(sql).toContain('INSERT INTO diary_entries');

    expect(parameters).toEqual(
      expect.objectContaining({
        $id: 'entry-created',
        $userId: 'user-1',
        $glucose: null,
        $mealRelation: null,
        $shortInsulin: null,
        $longInsulin: null,
        $carbsGram: null,
        $comment: 'Dinner',
        $aiAnalysis: '',
        $localPhotoUri: null,
        $photoPath: null,
        $photoUrl: null,
        $syncStatus: 'pendingCreate',
      })
    );

    expect(parameters.$eventAt).toEqual(expect.any(Number));
    expect(parameters.$eventAt).toBeGreaterThanOrEqual(earliestEventAt);
    expect(parameters.$eventAt).toBeLessThanOrEqual(latestEventAt);

    expect(useDiaryListStore.getState().currentPage).toBe(1);
    expect(useDiaryListStore.getState().collapsedDayKeys).toEqual(new Set());

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: diaryQueryKeys.localPagesRoot('user-1'),
    });
  });

  it('keeps the form open and shows an error when SQLite fails', async () => {
    const error = new Error('SQLite write failed');

    runAsync.mockRejectedValueOnce(error);

    const { onClose, onCreated } = renderForm();

    const commentInput = await screen.findByLabelText(
      'diary.form.commentAccessibilityLabel'
    );

    fireEvent.changeText(commentInput, '  Dinner  ');
    fireEvent.press(screen.getByLabelText('diary.form.create'));

    expect(
      await screen.findByText('diary.form.errors.creationFailed')
    ).toBeTruthy();

    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    expect(
      screen.getByLabelText('diary.form.commentAccessibilityLabel').props.value
    ).toBe('  Dinner  ');
  });
});
