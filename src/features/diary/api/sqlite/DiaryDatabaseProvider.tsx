import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { closeDiaryDatabase, openDiaryDatabase } from './diaryDatabase';
import type { DiaryRepository } from './diaryRepository';

type DiaryDatabaseStatus = 'opening' | 'ready' | 'error';

type DiaryDatabaseState = {
  userId: string;
  status: DiaryDatabaseStatus;
  repository: DiaryRepository | null;
  error: Error | null;
};

type DiaryDatabaseContextValue = Omit<DiaryDatabaseState, 'userId'> & {
  retry: () => void;
};

type DiaryDatabaseProviderProps = PropsWithChildren<{
  userId: string;
}>;

const DiaryDatabaseContext = createContext<DiaryDatabaseContextValue | null>(
  null
);

const createOpeningState = (userId: string): DiaryDatabaseState => ({
  userId,
  status: 'opening',
  repository: null,
  error: null,
});

const normalizeError = (error: unknown): Error =>
  error instanceof Error
    ? error
    : new Error('Failed to initialize diary database');

const closeDatabase = (): void => {
  void closeDiaryDatabase().catch((error) => {
    console.error('Failed to close diary database', error);
  });
};

export const DiaryDatabaseProvider = ({
  userId,
  children,
}: DiaryDatabaseProviderProps) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DiaryDatabaseState>(() =>
    createOpeningState(userId)
  );

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    setState(createOpeningState(userId));

    void openDiaryDatabase(userId).then(
      (repository) => {
        if (!isCurrent) {
          return;
        }

        setState({
          userId,
          status: 'ready',
          repository,
          error: null,
        });
      },
      (error) => {
        if (!isCurrent) {
          return;
        }

        setState({
          userId,
          status: 'error',
          repository: null,
          error: normalizeError(error),
        });
      }
    );

    return () => {
      isCurrent = false;
      closeDatabase();
    };
  }, [attempt, userId]);

  const currentState =
    state.userId === userId ? state : createOpeningState(userId);

  return (
    <DiaryDatabaseContext.Provider
      value={{
        status: currentState.status,
        repository: currentState.repository,
        error: currentState.error,
        retry,
      }}
    >
      {children}
    </DiaryDatabaseContext.Provider>
  );
};

export const useDiaryDatabase = (): DiaryDatabaseContextValue => {
  const context = useContext(DiaryDatabaseContext);

  if (context === null) {
    throw new Error(
      'useDiaryDatabase must be used within DiaryDatabaseProvider'
    );
  }

  return context;
};
