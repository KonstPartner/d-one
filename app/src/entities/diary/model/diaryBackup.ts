import type { DiaryEntry } from './diaryEntry';
import type { MealRelation } from './mealRelation';

export const DIARY_BACKUP_APP = 'd-one';

export const DIARY_BACKUP_FORMAT_VERSION = 2;

export const DIARY_BACKUP_SUPPORTED_FORMAT_VERSIONS = [1, 2] as const;

export type DiaryBackupFormatVersion =
  (typeof DIARY_BACKUP_SUPPORTED_FORMAT_VERSIONS)[number];

export const DIARY_BACKUP_CHUNK_SIZE = 300;

export const DIARY_BACKUP_EXPORT_TYPES = [
  'fullBackup',
  'lightweightBackup',
] as const;

export type DiaryBackupExportType = (typeof DIARY_BACKUP_EXPORT_TYPES)[number];

export type DiaryBackupRecordsScope =
  | {
      type: 'all';
    }
  | {
      type: 'selected';
    }
  | {
      type: 'period';
      from: string;
      to: string;
    };

type DiaryBackupManifestBase = {
  app: typeof DIARY_BACKUP_APP;
  formatVersion: DiaryBackupFormatVersion;
  exportedAt: string;

  sourceUserName: string;
  sourceUserId: string;

  entriesCount: number;

  recordsScope: DiaryBackupRecordsScope;

  chunks: string[];
};

export type DiaryBackupManifest =
  | (DiaryBackupManifestBase & {
      exportType: 'fullBackup';
      photosCount: number;
      withPhotos: true;
    })
  | (DiaryBackupManifestBase & {
      exportType: 'lightweightBackup';
      photosCount: 0;
      withPhotos: false;
    });

export type DiaryBackupEntry = {
  id: string;

  glucose: number | null;
  mealRelation: MealRelation | null;
  shortInsulin: number | null;
  ultraShortInsulin: number | null;
  longInsulin: number | null;
  carbsGram: number | null;

  comment: string;
  aiAnalysis: string;

  photoFileName: string | null;
  photoUrl: string | null;

  eventAt: string;
};

export const createDiaryBackupEntry = ({
  entry,
  photoFileName,
}: {
  entry: DiaryEntry;
  photoFileName: string | null;
}): DiaryBackupEntry => {
  if (entry.syncStatus === 'pendingDelete') {
    throw new Error(
      `Pending delete diary entry cannot be backed up: ${entry.id}`
    );
  }

  return {
    id: entry.id,

    glucose: entry.glucose,
    mealRelation: entry.mealRelation,
    shortInsulin: entry.shortInsulin,
    ultraShortInsulin: entry.ultraShortInsulin,
    longInsulin: entry.longInsulin,
    carbsGram: entry.carbsGram,

    comment: entry.comment,
    aiAnalysis: entry.aiAnalysis,

    photoFileName,
    photoUrl: entry.photoUrl,

    eventAt: entry.eventAt.toISOString(),
  };
};
