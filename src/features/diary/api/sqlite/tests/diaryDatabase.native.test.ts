import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

import { closeDiaryDatabase, openDiaryDatabase } from '../diaryDatabase.native';
import { migrateDiaryDatabase } from '../migrations';

jest.mock('expo-file-system', () => ({
  Directory: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    uri: 'file:///documents/users/test/database',
  })),
  Paths: {
    document: 'file:///documents',
  },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

jest.mock('../migrations', () => ({
  migrateDiaryDatabase: jest.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

type DatabaseMock = {
  closeAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (error: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
};

const createDatabaseMock = (): DatabaseMock => ({
  closeAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
});

const mockedOpenDatabaseAsync = jest.mocked(openDatabaseAsync);
const mockedMigrateDiaryDatabase = jest.mocked(migrateDiaryDatabase);

describe('diaryDatabase native lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMigrateDiaryDatabase.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await closeDiaryDatabase();
  });

  it('waits for an active repository operation before closing SQLite', async () => {
    const database = createDatabaseMock();
    const pendingRow = createDeferred<null>();

    database.getFirstAsync.mockReturnValueOnce(pendingRow.promise);
    mockedOpenDatabaseAsync.mockResolvedValueOnce(
      database as unknown as SQLiteDatabase
    );

    const repository = await openDiaryDatabase('user-1');
    const findPromise = repository.findById('entry-1');
    const closePromise = closeDiaryDatabase();

    await Promise.resolve();

    expect(database.closeAsync).not.toHaveBeenCalled();

    pendingRow.resolve(null);

    await expect(findPromise).resolves.toBeNull();
    await closePromise;

    expect(database.closeAsync).toHaveBeenCalledTimes(1);
  });

  it('rejects new repository operations after closing starts', async () => {
    const database = createDatabaseMock();
    const pendingRow = createDeferred<null>();

    database.getFirstAsync.mockReturnValueOnce(pendingRow.promise);
    mockedOpenDatabaseAsync.mockResolvedValueOnce(
      database as unknown as SQLiteDatabase
    );

    const repository = await openDiaryDatabase('user-1');
    const activeFindPromise = repository.findById('entry-1');
    const closePromise = closeDiaryDatabase();

    await expect(repository.findById('entry-2')).rejects.toThrow(
      'Diary database is not accepting new operations'
    );

    expect(database.getFirstAsync).toHaveBeenCalledTimes(1);
    expect(database.closeAsync).not.toHaveBeenCalled();

    pendingRow.resolve(null);

    await activeFindPromise;
    await closePromise;
  });

  it('closes the previous database before opening another user database', async () => {
    const firstDatabase = createDatabaseMock();
    const secondDatabase = createDatabaseMock();
    const pendingRow = createDeferred<null>();

    firstDatabase.getFirstAsync.mockReturnValueOnce(pendingRow.promise);
    mockedOpenDatabaseAsync
      .mockResolvedValueOnce(firstDatabase as unknown as SQLiteDatabase)
      .mockResolvedValueOnce(secondDatabase as unknown as SQLiteDatabase);

    const firstRepository = await openDiaryDatabase('user-1');
    const activeFindPromise = firstRepository.findById('entry-1');
    const secondOpenPromise = openDiaryDatabase('user-2');

    await Promise.resolve();

    expect(firstDatabase.closeAsync).not.toHaveBeenCalled();
    expect(mockedOpenDatabaseAsync).toHaveBeenCalledTimes(1);

    pendingRow.resolve(null);

    await activeFindPromise;

    const secondRepository = await secondOpenPromise;

    expect(secondRepository).not.toBe(firstRepository);
    expect(firstDatabase.closeAsync).toHaveBeenCalledTimes(1);
    expect(mockedOpenDatabaseAsync).toHaveBeenCalledTimes(2);
    expect(firstDatabase.closeAsync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedOpenDatabaseAsync.mock.invocationCallOrder[1]
    );
  });
});
