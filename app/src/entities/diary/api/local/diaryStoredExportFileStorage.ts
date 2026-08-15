export type DiaryStoredExportFileKind = 'backup' | 'csv';

export type DiaryStoredExportFile = {
  fileName: string;
  fileUri: string;
  fileSize: number;
  kind: DiaryStoredExportFileKind;
  modificationTime: number | null;
};

const createUnsupportedError = (): Error =>
  new Error('Stored diary exports are unavailable on this platform');

export const createDiaryStoredExportTargetUri = (_fileName: string): string => {
  throw createUnsupportedError();
};

export const listDiaryStoredExportFiles = (): DiaryStoredExportFile[] => {
  throw createUnsupportedError();
};

export const deleteDiaryStoredExportFiles = (
  _fileNames: readonly string[]
): void => {
  throw createUnsupportedError();
};
