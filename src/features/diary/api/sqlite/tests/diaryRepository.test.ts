import type { SQLiteDatabase } from 'expo-sqlite';

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

describe('DiaryRepository', () => {
  let getFirstAsync: jest.Mock;
  let getAllAsync: jest.Mock;
  let repository: DiaryRepository;

  beforeEach(() => {
    getFirstAsync = jest.fn();
    getAllAsync = jest.fn();

    const database = {
      getFirstAsync,
      getAllAsync,
    } as unknown as SQLiteDatabase;

    repository = new DiaryRepository(
      database,
      'user-1',
      new DiaryDatabaseOperationGate()
    );
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
