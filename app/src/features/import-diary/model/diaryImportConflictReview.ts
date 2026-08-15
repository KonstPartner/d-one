import type { DiaryBackupEntry, DiaryEntry } from '@entities/diary';

export type DiaryImportConflictReviewItem = {
  entryId: string;

  localEntry: DiaryEntry;
  backupEntry: DiaryBackupEntry;

  backupPhotoUri: string | null;
};
