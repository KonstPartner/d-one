import { Directory, Paths } from 'expo-file-system';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { DiaryRepository } from './diaryRepository';
import { migrateDiaryDatabase } from './migrations';

const DIARY_DATABASE_FILE_NAME = 'diary.db';

type ActiveDiaryDatabase = {
  userId: string;
  database: SQLiteDatabase;
  repository: DiaryRepository;
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
  if (activeDiaryDatabase === null) {
    return;
  }

  const { database } = activeDiaryDatabase;

  activeDiaryDatabase = null;

  await database.closeAsync();
};

const runDatabaseTransition = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = transitionQueue.then(operation);

  transitionQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
};

export const openDiaryDatabase = (userId: string): Promise<DiaryRepository> =>
  runDatabaseTransition(async () => {
    assertValidUserId(userId);

    if (activeDiaryDatabase?.userId === userId) {
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

    const repository = new DiaryRepository(database, userId);

    activeDiaryDatabase = {
      userId,
      database,
      repository,
    };

    return repository;
  });

export const closeDiaryDatabase = (): Promise<void> =>
  runDatabaseTransition(closeActiveDiaryDatabase);
