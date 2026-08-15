import type { DiaryBackupRecordsScope } from '@entities/diary';

import {
  deleteDiaryExportWork,
  listDiaryExportWorkStates,
  readDiaryExportWorkState,
} from '../api/diaryExportWorkStorage';

import type {
  DiaryExportWorkFormat,
  DiaryExportWorkPhase,
} from './diaryExportWorkState';

export type DiaryUnfinishedExport = {
  exportId: string;

  format: DiaryExportWorkFormat;
  phase: DiaryExportWorkPhase;

  fileName: string;
  exportedAt: Date;

  recordsScope: DiaryBackupRecordsScope;

  processedEntries: number;
  totalEntries: number;

  processedPhotos: number;
  totalPhotos: number;
};

const mapWorkStateToUnfinishedExport = (
  state: ReturnType<typeof readDiaryExportWorkState>
): DiaryUnfinishedExport => ({
  exportId: state.exportId,

  format: state.format,
  phase: state.phase,

  fileName: state.fileName,
  exportedAt: new Date(state.exportedAt),

  recordsScope: state.recordsScope,

  processedEntries: state.processedEntries,
  totalEntries: state.totalEntries,

  processedPhotos: state.processedPhotos,
  totalPhotos: state.totalPhotos,
});

export const listDiaryUnfinishedExports = (
  userId: string
): DiaryUnfinishedExport[] => {
  if (userId.length === 0) {
    throw new Error('Invalid diary export user');
  }

  return listDiaryExportWorkStates()
    .filter((state) => state.userId === userId)
    .map(mapWorkStateToUnfinishedExport);
};

export const deleteDiaryUnfinishedExport = ({
  userId,
  exportId,
}: {
  userId: string;
  exportId: string;
}): void => {
  if (userId.length === 0) {
    throw new Error('Invalid diary export user');
  }

  const state = readDiaryExportWorkState(exportId);

  if (state.userId !== userId) {
    throw new Error('Diary export work belongs to another user');
  }

  deleteDiaryExportWork(exportId);
};
