import { Directory, File, Paths } from 'expo-file-system';

export type DiaryStoredExportFileKind = 'backup' | 'csv';

export type DiaryStoredExportFile = {
  fileName: string;
  fileUri: string;
  fileSize: number;
  kind: DiaryStoredExportFileKind;
  modificationTime: number | null;
};

const EXPORTS_DIRECTORY_NAME = 'diaryExports';
const SAFE_EXPORT_FILE_NAME_PATTERN = /^[^/\\]+\.(zip|csv)$/i;

const getExportsDirectory = (): Directory => {
  const directory = new Directory(Paths.document, EXPORTS_DIRECTORY_NAME);

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  return directory;
};

const assertValidExportFileName = (fileName: string): void => {
  if (!SAFE_EXPORT_FILE_NAME_PATTERN.test(fileName)) {
    throw new Error('Invalid diary export file name');
  }
};

const getFileKind = (fileName: string): DiaryStoredExportFileKind =>
  fileName.toLowerCase().endsWith('.csv') ? 'csv' : 'backup';

export const createDiaryStoredExportTargetUri = (fileName: string): string => {
  assertValidExportFileName(fileName);

  const file = new File(getExportsDirectory(), fileName);

  if (file.exists) {
    throw new Error('Diary export file already exists');
  }

  return file.uri;
};

export const listDiaryStoredExportFiles = (): DiaryStoredExportFile[] => {
  const files = getExportsDirectory()
    .list()
    .filter(
      (item): item is File =>
        item instanceof File &&
        item.exists &&
        item.size > 0 &&
        SAFE_EXPORT_FILE_NAME_PATTERN.test(item.name)
    )
    .map(
      (file): DiaryStoredExportFile => ({
        fileName: file.name,
        fileUri: file.uri,
        fileSize: file.size,
        kind: getFileKind(file.name),
        modificationTime: file.modificationTime,
      })
    );

  files.sort((left, right) => {
    const leftTime = left.modificationTime ?? -1;
    const rightTime = right.modificationTime ?? -1;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.fileName.localeCompare(right.fileName);
  });

  return files;
};

export const deleteDiaryStoredExportFiles = (
  fileNames: readonly string[]
): void => {
  if (fileNames.length === 0) {
    return;
  }

  const uniqueFileNames = Array.from(new Set(fileNames));
  const directory = getExportsDirectory();

  uniqueFileNames.forEach((fileName) => {
    assertValidExportFileName(fileName);

    const file = new File(directory, fileName);

    if (file.exists) {
      file.delete();
    }
  });
};
