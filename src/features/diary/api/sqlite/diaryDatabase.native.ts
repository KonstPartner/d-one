import { Directory, Paths } from 'expo-file-system';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DiaryDatabaseOperationGate } from './diaryDatabaseOperationGate';
import { DiaryRepository } from './diaryRepository';
import { migrateDiaryDatabase } from './migrations';

const DIARY_DATABASE_FILE_NAME = 'diary.db';

type ActiveDiaryDatabase = {
  userId: string;
  database: SQLiteDatabase;
  repository: DiaryRepository;
  operationGate: DiaryDatabaseOperationGate;
};

let activeDiaryDatabase: ActiveDiaryDatabase | null = null;
let transitionQueue: Promise<void> = Promise.resolve();

const assertValidUserId = (userId: string): void => {
  if (
    userId.length === 0 ||
    userId === '.' ||
    userId === '..' ||
    userId.includes('/') ||
    userId.includes('\\') ||
    userId.includes('\0')
  ) {
    throw new Error('Invalid Firebase user ID');
  }
};

const createDiaryDatabaseDirectory = (userId: string): Directory => {
  const directory = new Directory(Paths.document, 'users', userId, 'database');

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  return directory;
};

const closeActiveDiaryDatabase = async (): Promise<void> => {
  const activeDatabase = activeDiaryDatabase;

  if (activeDatabase === null) {
    return;
  }

  await activeDatabase.operationGate.stopAndWaitForIdle();
  await activeDatabase.database.closeAsync();

  if (activeDiaryDatabase === activeDatabase) {
    activeDiaryDatabase = null;
  }
};

const runDatabaseTransition = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = transitionQueue.then(operation);

  transitionQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
};

export const openDiaryDatabase = (userId: string): Promise<DiaryRepository> => {
  try {
    assertValidUserId(userId);
  } catch (error) {
    return Promise.reject(error);
  }

  if (activeDiaryDatabase !== null && activeDiaryDatabase.userId !== userId) {
    void activeDiaryDatabase.operationGate.stopAndWaitForIdle();
  }

  return runDatabaseTransition(async () => {
    if (
      activeDiaryDatabase?.userId === userId &&
      !activeDiaryDatabase.operationGate.isClosing
    ) {
      return activeDiaryDatabase.repository;
    }

    await closeActiveDiaryDatabase();

    const databaseDirectory = createDiaryDatabaseDirectory(userId);

    const database = await openDatabaseAsync(
      DIARY_DATABASE_FILE_NAME,
      {
        useNewConnection: true,
      },
      databaseDirectory.uri
    );

    try {
      await migrateDiaryDatabase(database);
    } catch (error) {
      await database.closeAsync().catch(() => undefined);

      throw error;
    }

    const operationGate = new DiaryDatabaseOperationGate();
    const repository = new DiaryRepository(database, userId, operationGate);

    activeDiaryDatabase = {
      userId,
      database,
      repository,
      operationGate,
    };

    return repository;
  });
};

export const closeDiaryDatabase = (): Promise<void> => {
  if (activeDiaryDatabase !== null) {
    void activeDiaryDatabase.operationGate.stopAndWaitForIdle();
  }

  return runDatabaseTransition(closeActiveDiaryDatabase);
};
