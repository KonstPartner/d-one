import type { CloudDiaryEntry, DiaryEntry } from '@entities/diary';

export type CloudDiaryDownloadConflictResolution = 'skip' | 'replace';

export type CloudDiaryDownloadConflictStrategy =
  | 'skipAll'
  | 'replaceAll'
  | 'review';

export type CloudDiaryDownloadConflict = {
  cloudEntry: CloudDiaryEntry;
  localEntry: DiaryEntry;
};

export type CloudDiaryDownloadResolutionMap = ReadonlyMap<
  string,
  CloudDiaryDownloadConflictResolution
>;

export type DownloadCloudEntriesResult = {
  added: number;
  replaced: number;
  skipped: number;
  failed: number;
};

export type CloudDiaryDownloadSession = {
  conflicts: readonly CloudDiaryDownloadConflict[];

  complete: (
    resolutions: CloudDiaryDownloadResolutionMap
  ) => Promise<DownloadCloudEntriesResult>;

  cancel: () => void;
};
