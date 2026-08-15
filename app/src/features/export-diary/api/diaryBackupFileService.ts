import type { DiaryBackupFileSession } from './diaryBackupFileService.types';

export type DiaryBackupPersistentFileSession = DiaryBackupFileSession & {
  resetBatch: (input: {
    chunkNumber: number;
    entryIds: readonly string[];
  }) => void;
};

type CreateDiaryBackupFileSessionInput = {
  payloadUri: string;
};

const createUnsupportedError = (): Error =>
  new Error('Diary backup export is unavailable on this platform');

export const createDiaryBackupFileSession = (
  _input: CreateDiaryBackupFileSessionInput
): DiaryBackupPersistentFileSession => {
  throw createUnsupportedError();
};
