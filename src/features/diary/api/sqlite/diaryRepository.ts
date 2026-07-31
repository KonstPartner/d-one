import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  DiaryEntry,
  DiaryPageResult,
  DiarySyncStatus,
  MealRelation,
} from '../../model/types';
import { DIARY_SYNC_STATUSES, MEAL_RELATIONS } from '../../model/types';

const DIARY_PAGE_SIZE = 30;

type DiaryEntryRow = {
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

type DiaryCountRow = {
  total_items: number;
};

const FIND_DIARY_ENTRY_BY_ID_SQL = `
  SELECT
    id,
    user_id,
    glucose,
    meal_relation,
    short_insulin,
    long_insulin,
    carbs_gram,
    comment,
    ai_analysis,
    local_photo_uri,
    photo_path,
    photo_url,
    event_at,
    sync_status
  FROM diary_entries
  WHERE id = $id
    AND user_id = $userId
  LIMIT 1
`;

const FIND_DIARY_PAGE_SQL = `
  SELECT
    id,
    user_id,
    glucose,
    meal_relation,
    short_insulin,
    long_insulin,
    carbs_gram,
    comment,
    ai_analysis,
    local_photo_uri,
    photo_path,
    photo_url,
    event_at,
    sync_status
  FROM diary_entries
  WHERE user_id = $userId
  ORDER BY event_at DESC, id DESC
  LIMIT $limit OFFSET $offset
`;

const isMealRelation = (value: string): value is MealRelation =>
  MEAL_RELATIONS.some((mealRelation) => mealRelation === value);

const isDiarySyncStatus = (value: string): value is DiarySyncStatus =>
  DIARY_SYNC_STATUSES.some((syncStatus) => syncStatus === value);

const mapDiaryEntryRow = (row: DiaryEntryRow): DiaryEntry => {
  if (row.meal_relation !== null && !isMealRelation(row.meal_relation)) {
    throw new Error(`Invalid diary meal relation: ${row.meal_relation}`);
  }

  if (!isDiarySyncStatus(row.sync_status)) {
    throw new Error(`Invalid diary synchronization status: ${row.sync_status}`);
  }

  const eventAt = new Date(row.event_at);

  if (Number.isNaN(eventAt.getTime())) {
    throw new Error(`Invalid diary event date: ${row.event_at}`);
  }

  return {
    id: row.id,
    userId: row.user_id,
    glucose: row.glucose,
    mealRelation: row.meal_relation,
    shortInsulin: row.short_insulin,
    longInsulin: row.long_insulin,
    carbsGram: row.carbs_gram,
    comment: row.comment,
    aiAnalysis: row.ai_analysis,
    localPhotoUri: row.local_photo_uri,
    photoPath: row.photo_path,
    photoUrl: row.photo_url,
    eventAt,
    syncStatus: row.sync_status,
  };
};

export class DiaryRepository {
  public constructor(
    private readonly database: SQLiteDatabase,
    private readonly userId: string
  ) {}

  public async findById(id: string): Promise<DiaryEntry | null> {
    const row = await this.database.getFirstAsync<DiaryEntryRow>(
      FIND_DIARY_ENTRY_BY_ID_SQL,
      {
        $id: id,
        $userId: this.userId,
      }
    );

    return row === null ? null : mapDiaryEntryRow(row);
  }

  public async findPage(page: number): Promise<DiaryPageResult> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error(`Invalid diary page: ${page}`);
    }

    const countRow = await this.database.getFirstAsync<DiaryCountRow>(
      `
        SELECT COUNT(*) AS total_items
        FROM diary_entries
        WHERE user_id = ?
      `,
      this.userId
    );

    const totalItems = countRow?.total_items ?? 0;

    if (totalItems === 0) {
      return {
        items: [],
        pagination: {
          page: 1,
          pageSize: DIARY_PAGE_SIZE,
          totalItems: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }

    const totalPages = Math.ceil(totalItems / DIARY_PAGE_SIZE);
    const offset = (page - 1) * DIARY_PAGE_SIZE;

    const rows = await this.database.getAllAsync<DiaryEntryRow>(
      FIND_DIARY_PAGE_SQL,
      {
        $userId: this.userId,
        $limit: DIARY_PAGE_SIZE,
        $offset: offset,
      }
    );

    return {
      items: rows.map(mapDiaryEntryRow),
      pagination: {
        page,
        pageSize: DIARY_PAGE_SIZE,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }
}
