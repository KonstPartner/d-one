import type { SQLiteDatabase } from 'expo-sqlite';

import { DiaryDatabaseOperationGate } from '../diaryDatabaseOperationGate';
import { DiaryRepository } from '../diaryRepository';

describe('DiaryRepository markPendingDelete', () => {
  let runAsync: jest.Mock;
  let repository: DiaryRepository;

  beforeEach(() => {
    runAsync = jest.fn();

    const database = {
      runAsync,
    } as unknown as SQLiteDatabase;

    repository = new DiaryRepository(
      database,
      'user-1',
      new DiaryDatabaseOperationGate()
    );
  });

  it('atomically marks all selected available entries as pendingDelete', async () => {
    runAsync.mockResolvedValue({
      changes: 2,
      lastInsertRowId: 0,
    });

    await expect(
      repository.markPendingDelete(['entry-1', 'entry-2'])
    ).resolves.toBeUndefined();

    expect(runAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenCalledWith(expect.any(String), {
      $userId: 'user-1',
      $expectedCount: 2,
      $entryId0: 'entry-1',
      $entryId1: 'entry-2',
    });

    const [sql] = runAsync.mock.calls[0];

    expect(sql).toContain("SET sync_status = 'pendingDelete'");
    expect(sql).toContain('id IN ($entryId0, $entryId1)');
    expect(sql).toContain(
      "sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')"
    );
    expect(sql).toContain(') = $expectedCount');
  });

  it('deduplicates selected identifiers before the update', async () => {
    runAsync.mockResolvedValue({
      changes: 2,
      lastInsertRowId: 0,
    });

    await repository.markPendingDelete(['entry-1', 'entry-1', 'entry-2']);

    expect(runAsync).toHaveBeenCalledWith(expect.any(String), {
      $userId: 'user-1',
      $expectedCount: 2,
      $entryId0: 'entry-1',
      $entryId1: 'entry-2',
    });
  });

  it.each([
    { ids: [] },
    { ids: [''] },
    {
      ids: Array.from({ length: 31 }, (_, index) => `entry-${index}`),
    },
  ])('rejects an invalid deletion request', async ({ ids }) => {
    await expect(repository.markPendingDelete(ids)).rejects.toThrow(
      'Invalid diary entry deletion request'
    );

    expect(runAsync).not.toHaveBeenCalled();
  });

  it('rejects the whole request when one or more entries are unavailable', async () => {
    runAsync.mockResolvedValue({
      changes: 0,
      lastInsertRowId: 0,
    });

    await expect(
      repository.markPendingDelete(['entry-1', 'entry-2'])
    ).rejects.toThrow('One or more diary entries cannot be deleted');
  });

  it('propagates SQLite errors', async () => {
    const error = new Error('SQLite update failed');

    runAsync.mockRejectedValue(error);

    await expect(repository.markPendingDelete(['entry-1'])).rejects.toBe(error);
  });
});
