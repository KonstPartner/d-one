import { createContext, useContext } from 'react';

import type { DiaryLocalRepository } from './DiaryLocalRepository';

export type DiaryDatabaseStatus = 'opening' | 'ready' | 'error';

export type DiaryDatabaseContextValue = {
  userId: string;
  status: DiaryDatabaseStatus;
  repository: DiaryLocalRepository | null;
  error: Error | null;
  retry: () => void;
};

export type ReadyDiaryDatabase = {
  userId: string;
  repository: DiaryLocalRepository;
};

export const DiaryDatabaseContext =
  createContext<DiaryDatabaseContextValue | null>(null);

export const useDiaryDatabase = (): DiaryDatabaseContextValue => {
  const context = useContext(DiaryDatabaseContext);

  if (context === null) {
    throw new Error(
      'useDiaryDatabase must be used within DiaryDatabaseProvider'
    );
  }

  return context;
};

export const useReadyDiaryDatabase = (): ReadyDiaryDatabase => {
  const context = useDiaryDatabase();

  if (context.status !== 'ready' || context.repository === null) {
    throw new Error('Diary database repository is not ready');
  }

  return {
    userId: context.userId,
    repository: context.repository,
  };
};
