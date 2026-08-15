import type { DiaryBackupRecordsScope } from '@entities/diary';

import type { DiaryCsvLocalization } from './diaryCsv';

export const DIARY_EXPORT_WORK_VERSION = 1;

export const DIARY_EXPORT_WORK_FORMATS = [
  'fullBackup',
  'lightweightBackup',
  'csv',
] as const;

export type DiaryExportWorkFormat = (typeof DIARY_EXPORT_WORK_FORMATS)[number];

export const DIARY_EXPORT_WORK_PHASES = [
  'planning',
  'processing',
  'readyToFinalize',
] as const;

export type DiaryExportWorkPhase = (typeof DIARY_EXPORT_WORK_PHASES)[number];

export type DiaryExportWorkState = {
  version: typeof DIARY_EXPORT_WORK_VERSION;

  exportId: string;
  userId: string;
  userName: string;

  format: DiaryExportWorkFormat;
  fileName: string;
  exportedAt: string;

  recordsScope: DiaryBackupRecordsScope;

  phase: DiaryExportWorkPhase;

  planningSelectedEntryIds: string[] | null;

  csvLocalization?: DiaryCsvLocalization | null;

  totalEntries: number;
  totalPhotos: number;

  planChunksCount: number;
  completedPlanChunks: number;

  processedEntries: number;
  processedPhotos: number;

  photosCount: number;
  skippedPhotosCount: number;

  backupChunks: string[];
};

export type DiaryExportWorkPlanChunk = {
  chunkNumber: number;
  entryIds: string[];
};
