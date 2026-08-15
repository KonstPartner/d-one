import type { DiaryBackupExportType } from '@entities/diary';

export const DIARY_EXPORT_FORMATS = [
  'fullBackup',
  'lightweightBackup',
  'csv',
] as const;

export type DiaryExportFormat = DiaryBackupExportType | 'csv';

export type DiaryExportScope =
  | {
      type: 'all';
    }
  | {
      type: 'period';
      from: Date;
      to: Date;
    }
  | {
      type: 'selected';
      entryIds: readonly string[];
    };

export type DiaryExportRequest = {
  userId: string;
  userName: string;
  format: DiaryExportFormat;
  scope: DiaryExportScope;
  exportedAt: Date;
};

export type DiaryExportResult = {
  fileUri: string;
  fileName: string;
  fileSize: number;

  entriesCount: number;
  photosCount: number;
  skippedPhotosCount: number;
};
