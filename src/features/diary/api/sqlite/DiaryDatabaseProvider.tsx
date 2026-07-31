import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { queryClient } from '@features/shared/api';

import { diaryQueryKeys } from '../constants';

import { closeDiaryDatabase, openDiaryDatabase } from './diaryDatabase';
import type { DiaryRepository } from './diaryRepository';

type DiaryDatabaseStatus = 'opening' | 'ready' | 'error';

type DiaryDatabaseState = {
  userId: string;
  status: DiaryDatabaseStatus;
  repository: DiaryRepository | null;
  error: Error | null;
};

type DiaryDatabaseContextValue = DiaryDatabaseState & {
  retry: () => void;
};

type DiaryDatabaseProviderProps = PropsWithChildren<{
  userId: string;
}>;

type ReadyDiaryDatabaseContextValue = {
  userId: string;
  repository: DiaryRepository;
};

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

const releaseDatabase = (userId: string): void => {
  const queryKey = diaryQueryKeys.localRoot(userId);

  void queryClient
    .cancelQueries({
      queryKey,
    })
    .catch((error) => {
      console.error('Failed to cancel diary queries', error);
    });

  queryClient.removeQueries({
    queryKey,
  });

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
      releaseDatabase(userId);
    };
  }, [attempt, userId]);

  const currentState =
    state.userId === userId ? state : createOpeningState(userId);

  return (
    <DiaryDatabaseContext.Provider
      value={{
        userId: currentState.userId,
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

export const useReadyDiaryDatabase = (): ReadyDiaryDatabaseContextValue => {
  const context = useDiaryDatabase();

  if (context.status !== 'ready' || context.repository === null) {
    throw new Error('Diary database repository is not ready');
  }

  return {
    userId: context.userId,
    repository: context.repository,
  };
};
