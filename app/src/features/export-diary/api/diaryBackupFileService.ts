import type { DiaryBackupFileSession } from './diaryBackupFileService.types';

const createUnsupportedError = (): Error =>
  new Error('Diary backup export is unavailable on this platform');

export const createDiaryBackupFileSession = (): DiaryBackupFileSession => {
  throw createUnsupportedError();
};

export const removeDiaryExportFile = (_fileUri: string): void => {
  throw createUnsupportedError();
};
