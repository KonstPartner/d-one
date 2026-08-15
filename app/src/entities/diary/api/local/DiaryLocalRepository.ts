import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

import { DIARY_BACKUP_CHUNK_SIZE } from '../../model/diaryBackup';
import type { DiaryEntry } from '../../model/diaryEntry';
import type { DiaryPageResult } from '../../model/diaryPage';

import { buildDiaryEntryQuerySql } from './buildDiaryEntryQuerySql';
import type { DiaryDatabaseOperationGate } from './diaryDatabaseOperationGate';
import { type DiaryEntryRow, mapDiaryEntryRow } from './diaryEntryRow';
import {
  buildCountDiaryBackupEntriesSql,
  buildCountDiaryEntriesSql,
  buildFindDiaryBackupBatchSql,
  buildFindDiaryEntriesByIdsSql,
  buildFindDiaryPageSql,
  buildMarkDiaryEntriesPendingDeleteSql,
  CREATE_DIARY_ENTRY_SQL,
  DELETE_PENDING_DIARY_ENTRY_SQL,
  DIARY_PAGE_SIZE,
  FIND_DIARY_ENTRY_BY_ID_SQL,
  FIND_PENDING_DIARY_ENTRY_IDS_SQL,
  MARK_DIARY_ENTRY_SYNCED_IF_UNCHANGED_SQL,
  REPLACE_SYNCED_DIARY_ENTRY_SQL,
  UPDATE_DIARY_ENTRY_AI_ANALYSIS_SQL,
  UPDATE_DIARY_ENTRY_SQL,
  UPDATE_DIARY_ENTRY_WITH_PHOTO_SQL,
  UPDATE_PENDING_PHOTO_STATE_SQL,
} from './diaryRepository.sql';
import type {
  DiaryEntryQuery,
  DiaryRepositoryCreateInput,
  DiaryRepositorySyncedEntryInput,
  DiaryRepositoryUpdateInput,
} from './diaryRepository.types';
import { createDefaultDiaryEntryQuery } from './diaryRepository.types';

type DiaryCountRow = {
  total_items: number;
};

type DiaryBackupCountRow = {
  entries_count: number;
  local_photos_count: number;
};

type DiaryBackupStats = {
  entriesCount: number;
  localPhotosCount: number;
};

type DiaryBackupBatchInput = {
  offset: number;
  limit: number;
  query?: DiaryEntryQuery;
};

type DiaryEntryIdRow = {
  id: string;
};

type PendingPhotoStateUpdate = Pick<
  DiaryEntry,
  'id' | 'photoPath' | 'photoUrl'
>;

type AiAnalysisUpdate = Pick<DiaryEntry, 'id' | 'aiAnalysis'>;

type DiaryImportedBatchOperation = {
  type: 'insert' | 'replace';
  entry: DiaryRepositorySyncedEntryInput;
};

type PreparedDiaryImportedBatchOperation = {
  type: 'insert' | 'replace';
  entryId: string;
  parameters: Record<string, SQLiteBindValue>;
};

const getEventAtTimestamp = (eventAt: Date): number => {
  const timestamp = eventAt.getTime();

  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid diary event date');
  }

  return timestamp;
};

const createSyncedEntryParameters = (
  userId: string,
  input: DiaryRepositorySyncedEntryInput,
  eventAt: number
): Record<string, SQLiteBindValue> => ({
  $id: input.id,
  $userId: userId,

  $glucose: input.glucose,

  $mealRelation: input.mealRelation,

  $shortInsulin: input.shortInsulin,

  $longInsulin: input.longInsulin,

  $carbsGram: input.carbsGram,

  $comment: input.comment,

  $aiAnalysis: input.aiAnalysis,

  $localPhotoUri: input.localPhotoUri,

  $photoPath: input.photoPath,

  $photoUrl: input.photoUrl,

  $eventAt: eventAt,

  $syncStatus: 'synced',
});

const prepareDiaryImportedBatch = (
  userId: string,
  operations: readonly DiaryImportedBatchOperation[]
): readonly PreparedDiaryImportedBatchOperation[] | null => {
  if (operations.length === 0 || operations.length > DIARY_BACKUP_CHUNK_SIZE) {
    return null;
  }

  const seenEntryIds = new Set<string>();
  const prepared: PreparedDiaryImportedBatchOperation[] = [];

  for (const operation of operations) {
    if (
      operation.entry.id.length === 0 ||
      seenEntryIds.has(operation.entry.id)
    ) {
      return null;
    }

    seenEntryIds.add(operation.entry.id);

    const eventAt = getEventAtTimestamp(operation.entry.eventAt);

    prepared.push({
      type: operation.type,
      entryId: operation.entry.id,
      parameters: createSyncedEntryParameters(userId, operation.entry, eventAt),
    });
  }

  return prepared;
};

export class DiaryLocalRepository {
  public constructor(
    private readonly database: SQLiteDatabase,

    private readonly userId: string,

    private readonly operationGate: DiaryDatabaseOperationGate
  ) {}

  public create(input: DiaryRepositoryCreateInput): Promise<void> {
    let eventAt: number;

    try {
      eventAt = getEventAtTimestamp(input.eventAt);
    } catch (error) {
      return Promise.reject(error);
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

  public findByIds(ids: readonly string[]): Promise<DiaryEntry[]> {
    const uniqueIds = Array.from(new Set(ids));

    if (uniqueIds.length === 0) {
      return Promise.resolve([]);
    }

    if (uniqueIds.some((id) => id.length === 0)) {
      return Promise.reject(new Error('Invalid diary entry ids'));
    }

    const placeholders = uniqueIds.map((_, index) => `$entryId${index}`);

    const entriesList = placeholders.join(', ');

    const parameters: Record<string, SQLiteBindValue> = {
      $userId: this.userId,
    };

    uniqueIds.forEach((id, index) => {
      parameters[`$entryId${index}`] = id;
    });

    const sql = buildFindDiaryEntriesByIdsSql(entriesList);

    return this.operationGate.run(async () => {
      const rows = await this.database.getAllAsync<DiaryEntryRow>(
        sql,
        parameters
      );

      return rows.map(mapDiaryEntryRow);
    });
  }

  public countBackupEntries(
    query: DiaryEntryQuery = createDefaultDiaryEntryQuery()
  ): Promise<DiaryBackupStats> {
    let querySql;

    try {
      querySql = buildDiaryEntryQuerySql(this.userId, query);
    } catch (error) {
      return Promise.reject(error);
    }

    return this.operationGate.run(async () => {
      const row = await this.database.getFirstAsync<DiaryBackupCountRow>(
        buildCountDiaryBackupEntriesSql(querySql.whereSql),
        querySql.parameters
      );

      return {
        entriesCount: row?.entries_count ?? 0,
        localPhotosCount: row?.local_photos_count ?? 0,
      };
    });
  }

  public findBackupBatch({
    offset,
    limit,
    query = createDefaultDiaryEntryQuery(),
  }: DiaryBackupBatchInput): Promise<DiaryEntry[]> {
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > DIARY_BACKUP_CHUNK_SIZE
    ) {
      return Promise.reject(new Error('Invalid diary backup batch'));
    }

    let querySql;

    try {
      querySql = buildDiaryEntryQuerySql(this.userId, query);
    } catch (error) {
      return Promise.reject(error);
    }

    return this.operationGate.run(async () => {
      const rows = await this.database.getAllAsync<DiaryEntryRow>(
        buildFindDiaryBackupBatchSql(querySql.whereSql),
        {
          ...querySql.parameters,

          $limit: limit,

          $offset: offset,
        }
      );

      return rows.map(mapDiaryEntryRow);
    });
  }

  public insertSynced(input: DiaryRepositorySyncedEntryInput): Promise<void> {
    if (input.id.length === 0) {
      return Promise.reject(new Error('Invalid diary entry id'));
    }

    let eventAt: number;

    try {
      eventAt = getEventAtTimestamp(input.eventAt);
    } catch (error) {
      return Promise.reject(error);
    }

    const parameters = createSyncedEntryParameters(this.userId, input, eventAt);

    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        CREATE_DIARY_ENTRY_SQL,
        parameters
      );

      if (result.changes !== 1) {
        throw new Error(`Diary synced entry cannot be inserted: ${input.id}`);
      }
    });
  }

  public replaceSynced(input: DiaryRepositorySyncedEntryInput): Promise<void> {
    if (input.id.length === 0) {
      return Promise.reject(new Error('Invalid diary entry id'));
    }

    let eventAt: number;

    try {
      eventAt = getEventAtTimestamp(input.eventAt);
    } catch (error) {
      return Promise.reject(error);
    }

    const parameters = createSyncedEntryParameters(this.userId, input, eventAt);

    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        REPLACE_SYNCED_DIARY_ENTRY_SQL,
        parameters
      );

      if (result.changes !== 1) {
        throw new Error(`Diary synced entry cannot be replaced: ${input.id}`);
      }
    });
  }

  public applyImportedBatch(
    operations: readonly DiaryImportedBatchOperation[]
  ): Promise<void> {
    let prepared: readonly PreparedDiaryImportedBatchOperation[] | null;

    try {
      prepared = prepareDiaryImportedBatch(this.userId, operations);
    } catch (error) {
      return Promise.reject(error);
    }

    if (prepared === null) {
      return Promise.reject(new Error('Invalid diary import batch'));
    }

    return this.operationGate.run(async () => {
      await this.database.withTransactionAsync(async () => {
        for (const operation of prepared) {
          const result = await this.database.runAsync(
            operation.type === 'insert'
              ? CREATE_DIARY_ENTRY_SQL
              : REPLACE_SYNCED_DIARY_ENTRY_SQL,
            operation.parameters
          );

          if (result.changes !== 1) {
            throw new Error(
              `Diary imported entry cannot be ${
                operation.type === 'insert' ? 'inserted' : 'replaced'
              }: ${operation.entryId}`
            );
          }
        }
      });
    });
  }

  public findPendingIds(): Promise<string[]> {
    return this.operationGate.run(async () => {
      const rows = await this.database.getAllAsync<DiaryEntryIdRow>(
        FIND_PENDING_DIARY_ENTRY_IDS_SQL,
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
  }: PendingPhotoStateUpdate): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        UPDATE_PENDING_PHOTO_STATE_SQL,
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

  public updateAiAnalysis({ id, aiAnalysis }: AiAnalysisUpdate): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        UPDATE_DIARY_ENTRY_AI_ANALYSIS_SQL,
        {
          $id: id,
          $userId: this.userId,

          $aiAnalysis: aiAnalysis,
        }
      );

      if (result.changes !== 1) {
        throw new Error(`Diary AI analysis cannot be updated: ${id}`);
      }
    });
  }

  public markSyncedIfUnchanged(entry: DiaryEntry): Promise<boolean> {
    let eventAt: number;

    try {
      eventAt = getEventAtTimestamp(entry.eventAt);
    } catch (error) {
      return Promise.reject(error);
    }

    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        MARK_DIARY_ENTRY_SYNCED_IF_UNCHANGED_SQL,
        {
          $id: entry.id,

          $userId: this.userId,

          $glucose: entry.glucose,

          $mealRelation: entry.mealRelation,

          $shortInsulin: entry.shortInsulin,

          $longInsulin: entry.longInsulin,

          $carbsGram: entry.carbsGram,

          $comment: entry.comment,

          $aiAnalysis: entry.aiAnalysis,

          $localPhotoUri: entry.localPhotoUri,

          $photoPath: entry.photoPath,

          $photoUrl: entry.photoUrl,

          $eventAt: eventAt,

          $syncStatus: entry.syncStatus,
        }
      );

      if (result.changes > 1) {
        throw new Error(
          `Unexpected synchronized diary entry count: ${entry.id}`
        );
      }

      return result.changes === 1;
    });
  }

  public deletePending(id: string): Promise<void> {
    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(
        DELETE_PENDING_DIARY_ENTRY_SQL,
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

  public update(input: DiaryRepositoryUpdateInput): Promise<void> {
    let eventAt: number;

    try {
      eventAt = getEventAtTimestamp(input.eventAt);
    } catch (error) {
      return Promise.reject(error);
    }

    return this.operationGate.run(async () => {
      const parameters: Record<string, SQLiteBindValue> = {
        $id: input.id,

        $userId: this.userId,

        $glucose: input.glucose,

        $mealRelation: input.mealRelation,

        $shortInsulin: input.shortInsulin,

        $longInsulin: input.longInsulin,

        $carbsGram: input.carbsGram,

        $comment: input.comment,

        $eventAt: eventAt,
      };

      if (input.photo !== undefined) {
        parameters.$localPhotoUri = input.photo.localPhotoUri;

        parameters.$photoPath = input.photo.photoPath;

        parameters.$photoUrl = input.photo.photoUrl;
      }

      const result = await this.database.runAsync(
        input.photo === undefined
          ? UPDATE_DIARY_ENTRY_SQL
          : UPDATE_DIARY_ENTRY_WITH_PHOTO_SQL,
        parameters
      );

      if (result.changes !== 1) {
        throw new Error(`Diary entry cannot be updated: ${input.id}`);
      }
    });
  }

  public markPendingDelete(ids: readonly string[]): Promise<void> {
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

    const parameters: Record<string, SQLiteBindValue> = {
      $userId: this.userId,

      $expectedCount: uniqueIds.length,
    };

    uniqueIds.forEach((id, index) => {
      parameters[`$entryId${index}`] = id;
    });

    const sql = buildMarkDiaryEntriesPendingDeleteSql(entriesList);

    return this.operationGate.run(async () => {
      const result = await this.database.runAsync(sql, parameters);

      if (result.changes !== uniqueIds.length) {
        throw new Error('One or more diary entries cannot be deleted');
      }
    });
  }

  public findPage(
    page: number,
    query: DiaryEntryQuery = createDefaultDiaryEntryQuery()
  ): Promise<DiaryPageResult> {
    if (!Number.isInteger(page) || page < 1) {
      return Promise.reject(new Error(`Invalid diary page: ${page}`));
    }

    let querySql;

    try {
      querySql = buildDiaryEntryQuerySql(this.userId, query);
    } catch (error) {
      return Promise.reject(error);
    }

    return this.operationGate.run(async () => {
      const countRow = await this.database.getFirstAsync<DiaryCountRow>(
        buildCountDiaryEntriesSql(querySql.whereSql),
        querySql.parameters
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
        buildFindDiaryPageSql(querySql.whereSql),
        {
          ...querySql.parameters,

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
