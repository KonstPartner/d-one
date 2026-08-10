import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';

import { closeDiaryDatabase, openDiaryDatabase } from './diaryDatabase';
import {
  DiaryDatabaseContext,
  type DiaryDatabaseContextValue,
} from './diaryDatabaseContext';
import { diaryLocalQueryKeys } from './diaryLocalQueryKeys';
import type { DiaryLocalRepository } from './DiaryLocalRepository';

type DiaryDatabaseState = {
  userId: string;
  status: DiaryDatabaseContextValue['status'];
  repository: DiaryLocalRepository | null;
  error: Error | null;
};

type DiaryDatabaseProviderProps = PropsWithChildren<{
  userId: string;
}>;

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

const releaseDatabase = (queryClient: QueryClient, userId: string): void => {
  const queryKey = diaryLocalQueryKeys.root(userId);

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
  const queryClient = useQueryClient();

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

      releaseDatabase(queryClient, userId);
    };
  }, [attempt, queryClient, userId]);

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
