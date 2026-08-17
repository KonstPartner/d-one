import type { DiaryBackupExportType } from '@entities/diary';

import type { DiaryCsvLocalization } from './diaryCsv';

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

type DiaryExportRequestBase = {
  userName: string;
  scope: DiaryExportScope;
};

export type DiaryExportRequest =
  | (DiaryExportRequestBase & {
      format: DiaryBackupExportType;
    })
  | (DiaryExportRequestBase & {
      format: 'csv';
      localization: DiaryCsvLocalization;
    });

export type DiaryExportResult = {
  fileUri: string;
  fileName: string;
  fileSize: number;

  entriesCount: number;
  photosCount: number;
  skippedPhotosCount: number;
};
