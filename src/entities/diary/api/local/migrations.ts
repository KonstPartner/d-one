import type { SQLiteDatabase } from 'expo-sqlite';

const CURRENT_DATABASE_VERSION = 1;

type UserVersionRow = {
  user_version: number;
};

const MIGRATE_TO_VERSION_ONE_SQL = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    glucose REAL,
    meal_relation TEXT,
    short_insulin REAL,
    long_insulin REAL,
    carbs_gram REAL,
    comment TEXT NOT NULL DEFAULT '',
    ai_analysis TEXT NOT NULL DEFAULT '',
    local_photo_uri TEXT,
    photo_path TEXT,
    photo_url TEXT,
    event_at INTEGER NOT NULL,
    sync_status TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_diary_entries_event_at
  ON diary_entries(event_at DESC, id DESC);

  CREATE INDEX IF NOT EXISTS idx_diary_entries_sync_status
  ON diary_entries(sync_status);

  PRAGMA user_version = 1;
`;

const migrateToVersionOne = async (database: SQLiteDatabase): Promise<void> => {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.execAsync(MIGRATE_TO_VERSION_ONE_SQL);
  });
};

export const migrateDiaryDatabase = async (
  database: SQLiteDatabase
): Promise<void> => {
  const versionRow = await database.getFirstAsync<UserVersionRow>(
    'PRAGMA user_version'
  );

  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > CURRENT_DATABASE_VERSION) {
    throw new Error(`Unsupported diary database version: ${currentVersion}`);
  }

  if (currentVersion < 1) {
    await migrateToVersionOne(database);
  }
};
