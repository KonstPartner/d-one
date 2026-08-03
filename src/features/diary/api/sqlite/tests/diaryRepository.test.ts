import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CreateDiaryEntryInput,
  UpdateDiaryEntryData,
} from '../../../model/types';
import { DiaryDatabaseOperationGate } from '../diaryDatabaseOperationGate';
import { DiaryRepository } from '../diaryRepository';

type DiaryEntryRowFixture = {
  id: string;
  user_id: string;
  glucose: number | null;
  meal_relation: string | null;
  short_insulin: number | null;
  long_insulin: number | null;
  carbs_gram: number | null;
  comment: string;
  ai_analysis: string;
  local_photo_uri: string | null;
  photo_path: string | null;
  photo_url: string | null;
  event_at: number;
  sync_status: string;
};

const eventAt = Date.UTC(2026, 6, 31, 18, 30);

const createInput = (
  overrides: Partial<CreateDiaryEntryInput> = {}
): CreateDiaryEntryInput => ({
  id: 'entry-1',
  glucose: 6.5,
  mealRelation: 'beforeMeal',
  shortInsulin: 4,
  longInsulin: 10,
  carbsGram: 35,
  comment: 'Dinner',
  localPhotoUri: null,
  photoPath: null,
  eventAt: new Date(eventAt),
  ...overrides,
});

const createRow = (
  overrides: Partial<DiaryEntryRowFixture> = {}
): DiaryEntryRowFixture => ({
  id: 'entry-1',
  user_id: 'user-1',
  glucose: 6.5,
  meal_relation: 'beforeMeal',
  short_insulin: 4,
  long_insulin: 10,
  carbs_gram: 35,
  comment: 'Dinner',
  ai_analysis: '',
  local_photo_uri: null,
  photo_path: null,
  photo_url: null,
  event_at: eventAt,
  sync_status: 'synced',
  ...overrides,
});

const createUpdateData = (
  overrides: Partial<UpdateDiaryEntryData> = {}
): UpdateDiaryEntryData => ({
  id: 'entry-1',
  glucose: 7.2,
  mealRelation: 'afterMeal',
  shortInsulin: 5,
  longInsulin: 11,
  carbsGram: 40,
  comment: 'Updated dinner',
  eventAt: new Date(eventAt + 60_000),
  ...overrides,
});

describe('DiaryRepository', () => {
  let runAsync: jest.Mock;
  let getFirstAsync: jest.Mock;
  let getAllAsync: jest.Mock;
  let repository: DiaryRepository;

  beforeEach(() => {
    runAsync = jest.fn();
    getFirstAsync = jest.fn();
    getAllAsync = jest.fn();

    const database = {
      runAsync,
      getFirstAsync,
      getAllAsync,
    } as unknown as SQLiteDatabase;

    repository = new DiaryRepository(
      database,
      'user-1',
      new DiaryDatabaseOperationGate()
    );
  });

  describe('create', () => {
    it('creates a pending local entry for the current user', async () => {
      runAsync.mockResolvedValue({
        changes: 1,
        lastInsertRowId: 1,
      });

      await expect(repository.create(createInput())).resolves.toBeUndefined();

      expect(runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO diary_entries'),
        {
          $id: 'entry-1',
          $userId: 'user-1',
          $glucose: 6.5,
          $mealRelation: 'beforeMeal',
          $shortInsulin: 4,
          $longInsulin: 10,
          $carbsGram: 35,
          $comment: 'Dinner',
          $aiAnalysis: '',
          $localPhotoUri: null,
          $photoPath: null,
          $photoUrl: null,
          $eventAt: eventAt,
          $syncStatus: 'pendingCreate',
        }
      );
    });

    it('stores prepared local photo information', async () => {
      runAsync.mockResolvedValue({
        changes: 1,
        lastInsertRowId: 1,
      });

      await repository.create(
        createInput({
          localPhotoUri: 'file:///diary/entry-1.jpg',
          photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
        })
      );

      expect(runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          $localPhotoUri: 'file:///diary/entry-1.jpg',
          $photoPath: 'users/user-1/diaryPhotos/entry-1.jpg',
          $photoUrl: null,
          $syncStatus: 'pendingCreate',
        })
      );
    });

    it('rejects an invalid event date before accessing SQLite', async () => {
      await expect(
        repository.create(
          createInput({
            eventAt: new Date(Number.NaN),
          })
        )
      ).rejects.toThrow('Invalid diary event date');

      expect(runAsync).not.toHaveBeenCalled();
    });

    it('propagates SQLite errors', async () => {
      const error = new Error('SQLite insert failed');

      runAsync.mockRejectedValue(error);

      await expect(repository.create(createInput())).rejects.toBe(error);
    });
  });

  describe('findById', () => {
    it('loads and maps an entry belonging to the current user', async () => {
      const row = createRow();

      getFirstAsync.mockResolvedValue(row);

      const result = await repository.findById('entry-1');

      expect(result).toEqual({
        id: 'entry-1',
        userId: 'user-1',
        glucose: 6.5,
        mealRelation: 'beforeMeal',
        shortInsulin: 4,
        longInsulin: 10,
        carbsGram: 35,
        comment: 'Dinner',
        aiAnalysis: '',
        localPhotoUri: null,
        photoPath: null,
        photoUrl: null,
        eventAt: new Date(eventAt),
        syncStatus: 'synced',
      });

      expect(getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $id'),
        {
          $id: 'entry-1',
          $userId: 'user-1',
        }
      );

      const [sql] = getFirstAsync.mock.calls[0];

      expect(sql).toContain('AND user_id = $userId');
    });

    it('returns null when the entry does not exist', async () => {
      getFirstAsync.mockResolvedValue(null);

      await expect(repository.findById('missing-entry')).resolves.toBeNull();
    });

    it.each([
      {
        name: 'meal relation',
        overrides: {
          meal_relation: 'invalid-relation',
        },
        message: 'Invalid diary meal relation: invalid-relation',
      },
      {
        name: 'synchronization status',
        overrides: {
          sync_status: 'invalid-status',
        },
        message: 'Invalid diary synchronization status: invalid-status',
      },
      {
        name: 'event date',
        overrides: {
          event_at: Number.NaN,
        },
        message: 'Invalid diary event date: NaN',
      },
    ])('rejects invalid $name from SQLite', async ({ overrides, message }) => {
      getFirstAsync.mockResolvedValue(createRow(overrides));

      await expect(repository.findById('entry-1')).rejects.toThrow(message);
    });

    it('propagates SQLite errors', async () => {
      const error = new Error('SQLite request failed');

      getFirstAsync.mockRejectedValue(error);

      await expect(repository.findById('entry-1')).rejects.toBe(error);
    });
  });

  describe('update', () => {
    it('updates only editable fields for the current user', async () => {
      runAsync.mockResolvedValue({
        changes: 1,
        lastInsertRowId: 0,
      });

      await expect(
        repository.update(createUpdateData())
      ).resolves.toBeUndefined();

      expect(runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE diary_entries'),
        {
          $id: 'entry-1',
          $userId: 'user-1',
          $glucose: 7.2,
          $mealRelation: 'afterMeal',
          $shortInsulin: 5,
          $longInsulin: 11,
          $carbsGram: 40,
          $comment: 'Updated dinner',
          $eventAt: eventAt + 60_000,
        }
      );

      const [sql, parameters] = runAsync.mock.calls[0];

      expect(sql).not.toContain('ai_analysis =');
      expect(sql).not.toContain('local_photo_uri =');
      expect(sql).not.toContain('photo_path =');
      expect(sql).not.toContain('photo_url =');
      expect(parameters).not.toHaveProperty('$aiAnalysis');
      expect(parameters).not.toHaveProperty('$localPhotoUri');
      expect(parameters).not.toHaveProperty('$photoPath');
      expect(parameters).not.toHaveProperty('$photoUrl');
    });

    it('preserves pendingCreate and marks synchronized entries as pendingUpdate', async () => {
      runAsync.mockResolvedValue({
        changes: 1,
        lastInsertRowId: 0,
      });

      await repository.update(createUpdateData());

      const [sql] = runAsync.mock.calls[0];

      expect(sql).toContain("WHEN 'pendingCreate' THEN 'pendingCreate'");
      expect(sql).toContain("ELSE 'pendingUpdate'");
    });

    it('does not update pendingDelete entries', async () => {
      runAsync.mockResolvedValue({
        changes: 0,
        lastInsertRowId: 0,
      });

      await expect(repository.update(createUpdateData())).rejects.toThrow(
        'Diary entry cannot be updated: entry-1'
      );

      const [sql] = runAsync.mock.calls[0];

      expect(sql).toContain(
        "sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')"
      );
    });

    it('rejects a missing entry', async () => {
      runAsync.mockResolvedValue({
        changes: 0,
        lastInsertRowId: 0,
      });

      await expect(repository.update(createUpdateData())).rejects.toThrow(
        'Diary entry cannot be updated: entry-1'
      );
    });

    it('rejects an invalid event date before accessing SQLite', async () => {
      await expect(
        repository.update(
          createUpdateData({
            eventAt: new Date(Number.NaN),
          })
        )
      ).rejects.toThrow('Invalid diary event date');

      expect(runAsync).not.toHaveBeenCalled();
    });

    it('propagates SQLite errors', async () => {
      const error = new Error('SQLite update failed');

      runAsync.mockRejectedValue(error);

      await expect(repository.update(createUpdateData())).rejects.toBe(error);
    });
  });

  describe('findPage', () => {
    it('returns the empty first page when no entries exist', async () => {
      getFirstAsync.mockResolvedValue({
        total_items: 0,
      });

      const result = await repository.findPage(3);

      expect(result).toEqual({
        items: [],
        pagination: {
          page: 1,
          pageSize: 30,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });

      expect(getAllAsync).not.toHaveBeenCalled();
    });

    it('returns mapped entries and pagination information', async () => {
      const firstRow = createRow();
      const secondRow = createRow({
        id: 'entry-2',
        event_at: eventAt - 60_000,
      });

      getFirstAsync.mockResolvedValue({
        total_items: 61,
      });
      getAllAsync.mockResolvedValue([firstRow, secondRow]);

      const result = await repository.findPage(2);

      expect(
        result.items.map((entry) => ({
          id: entry.id,
          eventAt: entry.eventAt,
        }))
      ).toEqual([
        {
          id: 'entry-1',
          eventAt: new Date(firstRow.event_at),
        },
        {
          id: 'entry-2',
          eventAt: new Date(secondRow.event_at),
        },
      ]);

      expect(result.pagination).toEqual({
        page: 2,
        pageSize: 30,
        totalItems: 61,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      });

      expect(getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) AS total_items'),
        'user-1'
      );

      expect(getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY event_at DESC, id DESC'),
        {
          $userId: 'user-1',
          $limit: 30,
          $offset: 30,
        }
      );
    });

    it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
      'rejects invalid page %s',
      async (page) => {
        await expect(repository.findPage(page)).rejects.toThrow(
          'Invalid diary page'
        );

        expect(getFirstAsync).not.toHaveBeenCalled();
        expect(getAllAsync).not.toHaveBeenCalled();
      }
    );
  });
});
