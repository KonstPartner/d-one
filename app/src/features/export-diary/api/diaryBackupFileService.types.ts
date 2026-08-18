import type { DiaryBackupEntry, DiaryBackupManifest } from '@entities/diary';

type DiaryBackupArchiveResult = {
  fileUri: string;
  fileSize: number;
};

export type DiaryBackupFileSession = {
  addLocalPhoto: (input: {
    entryId: string;
    localPhotoUri: string | null;
  }) => string | null;

  writeEntriesChunk: (input: {
    chunkNumber: number;
    entries: readonly DiaryBackupEntry[];
  }) => string;

  writeManifest: (manifest: DiaryBackupManifest) => void;

  createArchive: (fileName: string) => Promise<DiaryBackupArchiveResult>;

  cleanupWorkingFiles: () => void;
};
