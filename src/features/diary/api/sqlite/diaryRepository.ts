import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CreateDiaryEntryInput,
  DiaryEntry,
  DiaryPageResult,
  DiarySyncStatus,
  MealRelation,
  UpdateDiaryEntryData,
} from '../../model/types';
import { DIARY_SYNC_STATUSES, MEAL_RELATIONS } from '../../model/types';

import type { DiaryDatabaseOperationGate } from './diaryDatabaseOperationGate';

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

type DiaryEntryIdRow = {
  id: string;
};

type DiaryEntryPhotoUpdate = Pick<
  DiaryEntry,
  'localPhotoUri' | 'photoPath' | 'photoUrl'
>;

type UpdateDiaryEntryInput = UpdateDiaryEntryData & {
  photo?: DiaryEntryPhotoUpdate;
};

const CREATE_DIARY_ENTRY_SQL = `
  INSERT INTO diary_entries (
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
  )
  VALUES (
    $id,
    $userId,
    $glucose,
    $mealRelation,
    $shortInsulin,
    $longInsulin,
    $carbsGram,
    $comment,
    $aiAnalysis,
    $localPhotoUri,
    $photoPath,
    $photoUrl,
    $eventAt,
    $syncStatus
  )
`;

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

const UPDATE_DIARY_ENTRY_SQL = `
  UPDATE diary_entries
  SET
    glucose = $glucose,
    meal_relation = $mealRelation,
    short_insulin = $shortInsulin,
    long_insulin = $longInsulin,
    carbs_gram = $carbsGram,
    comment = $comment,
    event_at = $eventAt,
    sync_status = CASE sync_status
      WHEN 'pendingCreate' THEN 'pendingCreate'
      ELSE 'pendingUpdate'
    END
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
`;

const UPDATE_DIARY_ENTRY_WITH_PHOTO_SQL = `
  UPDATE diary_entries
  SET
    glucose = $glucose,
    meal_relation = $mealRelation,
    short_insulin = $shortInsulin,
    long_insulin = $longInsulin,
    carbs_gram = $carbsGram,
    comment = $comment,
    local_photo_uri = $localPhotoUri,
    photo_path = $photoPath,
    photo_url = $photoUrl,
    event_at = $eventAt,
    sync_status = CASE sync_status
      WHEN 'pendingCreate' THEN 'pendingCreate'
      ELSE 'pendingUpdate'
    END
  WHERE id = $id
    AND user_id = $userId
    AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
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
    private readonly userId: string,
    private readonly operationGate: DiaryDatabaseOperationGate
  ) {}

  public create(input: CreateDiaryEntryInput): Promise<void> {
    const eventAt = input.eventAt.getTime();

    if (Number.isNaN(eventAt)) {
      return Promise.reject(new Error('Invalid diary event date'));
    }

    return this.operationGate.run(async () => {
      await this.database.runAsync(CREATE_DIARY_ENTRY_SQL, {
        $id: input.id,
        $userId: this.userId,
        $glucose: input.glucose,
        $mealRelation: input.mealRelation,
        $shortInsulin: input.shortInsulin,
        $longInsulin: input.longInsulin,
        $carbsGram: input.carbsGram,
        $comment: input.comment,
        $aiAnalysis: '',
        $localPhotoUri: input.localPhotoUri,
        $photoPath: input.photoPath,
        $photoUrl: null,
        $eventAt: eventAt,
        $syncStatus: 'pendingCreate',
      });
    });
  }

  public findById(id: string): Promise<DiaryEntry | null> {
    return this.operationGate.run(async () => {
      const row = await this.database.getFirstAsync<DiaryEntryRow>(
        FIND_DIARY_ENTRY_BY_ID_SQL,
        {
          $id: id,
          $userId: this.userId,
        }
      );

      return row === null ? null : mapDiaryEntryRow(row);
    });
  }

  public findPendingIds(): Promise<string[]> {
    return this.operationGate.run(async () => {
      const rows = await this.database.getAllAsync<DiaryEntryIdRow>(
        `
          SELECT id
          FROM diary_entries
          WHERE user_id = $userId
            AND sync_status IN (
              'pendingCreate',
              'pendingUpdate',
              'pendingDelete'
            )
          ORDER BY event_at DESC, id DESC
        `,
        {
          $userId: this.userId,
        }
      );

      return rows.map((row) => row.id);
    });
  }

  public updatePendingPhotoState({
    id,
    photoPath,
    photoUrl,
  }: Pick<DiaryEntry, 'id' | 'photoPath' | 'photoUrl'>): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        `
          UPDATE diary_entries
          SET
            photo_path = $photoPath,
            photo_url = $photoUrl
          WHERE id = $id
            AND user_id = $userId
            AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
        `,
        {
          $id: id,
          $userId: this.userId,
          $photoPath: photoPath,
          $photoUrl: photoUrl,
        }
      );

      if (result.changes !== 1) {
        throw new Error(`Diary photo state cannot be updated: ${id}`);
      }
    });
  }

  public markSynced(id: string): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        `
          UPDATE diary_entries
          SET sync_status = 'synced'
          WHERE id = $id
            AND user_id = $userId
            AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
        `,
        {
          $id: id,
          $userId: this.userId,
        }
      );

      if (result.changes !== 1) {
        throw new Error(`Diary entry cannot be marked as synchronized: ${id}`);
      }
    });
  }

  public deletePending(id: string): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        `
          DELETE FROM diary_entries
          WHERE id = $id
            AND user_id = $userId
            AND sync_status = 'pendingDelete'
        `,
        {
          $id: id,
          $userId: this.userId,
        }
      );

      if (result.changes !== 1) {
        throw new Error(`Diary entry cannot be physically deleted: ${id}`);
      }
    });
  }

  public update(data: UpdateDiaryEntryInput): Promise<void> {
    const eventAt = data.eventAt.getTime();

    if (Number.isNaN(eventAt)) {
      return Promise.reject(new Error('Invalid diary event date'));
    }

    return this.operationGate.run(async () => {
      const parameters = {
        $id: data.id,
        $userId: this.userId,
        $glucose: data.glucose,
        $mealRelation: data.mealRelation,
        $shortInsulin: data.shortInsulin,
        $longInsulin: data.longInsulin,
        $carbsGram: data.carbsGram,
        $comment: data.comment,
        $eventAt: eventAt,
        ...(data.photo === undefined
          ? {}
          : {
              $localPhotoUri: data.photo.localPhotoUri,
              $photoPath: data.photo.photoPath,
              $photoUrl: data.photo.photoUrl,
            }),
      };

      const result = await this.database.runAsync(
        data.photo === undefined
          ? UPDATE_DIARY_ENTRY_SQL
          : UPDATE_DIARY_ENTRY_WITH_PHOTO_SQL,
        parameters
      );

      if (result.changes !== 1) {
        throw new Error(`Diary entry cannot be updated: ${data.id}`);
      }
    });
  }

  public markPendingDelete(ids: ReadonlyArray<string>): Promise<void> {
    const uniqueIds = Array.from(new Set(ids));

    if (
      uniqueIds.length === 0 ||
      uniqueIds.length > DIARY_PAGE_SIZE ||
      uniqueIds.some((id) => id.length === 0)
    ) {
      return Promise.reject(new Error('Invalid diary entry deletion request'));
    }

    const placeholders = uniqueIds.map((_, index) => `$entryId${index}`);
    const entriesList = placeholders.join(', ');

    const parameters: Record<string, string | number> = {
      $userId: this.userId,
      $expectedCount: uniqueIds.length,
    };

    uniqueIds.forEach((id, index) => {
      parameters[`$entryId${index}`] = id;
    });

    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        `
          UPDATE diary_entries
          SET sync_status = 'pendingDelete'
          WHERE user_id = $userId
            AND id IN (${entriesList})
            AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
            AND (
              SELECT COUNT(*)
              FROM diary_entries
              WHERE user_id = $userId
                AND id IN (${entriesList})
                AND sync_status IN ('synced', 'pendingCreate', 'pendingUpdate')
            ) = $expectedCount
        `,
        parameters
      );

      if (result.changes !== uniqueIds.length) {
        throw new Error('One or more diary entries cannot be deleted');
      }
    });
  }

  public findPage(page: number): Promise<DiaryPageResult> {
    if (!Number.isInteger(page) || page < 1) {
      return Promise.reject(new Error(`Invalid diary page: ${page}`));
    }

    return this.operationGate.run(async () => {
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
    });
  }
}
