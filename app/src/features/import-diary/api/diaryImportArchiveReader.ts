import { Directory, File } from 'expo-file-system';

import type { DiaryBackupEntry } from '@entities/diary';

import type { DiaryValidatedBackupArchive } from '../model/diaryBackupValidation';
import {
  DiaryImportValidationError,
  isSafeDiaryBackupRelativePath,
  validateDiaryBackupChunk,
} from '../model/diaryBackupValidation';

const resolveEntriesChunkFile = ({
  archive,
  relativePath,
}: {
  archive: DiaryValidatedBackupArchive;
  relativePath: string;
}): File => {
  if (!isSafeDiaryBackupRelativePath(relativePath)) {
    throw new DiaryImportValidationError('unsafePath');
  }

  const [directoryName, fileName, ...rest] = relativePath.split('/');

  if (
    directoryName !== 'entries' ||
    fileName === undefined ||
    rest.length > 0
  ) {
    throw new DiaryImportValidationError('unsafePath');
  }

  return new File(new Directory(archive.payloadUri, directoryName), fileName);
};

export const readDiaryImportChunkEntries = async ({
  archive,
  relativePath,
}: {
  archive: DiaryValidatedBackupArchive;
  relativePath: string;
}): Promise<readonly DiaryBackupEntry[]> => {
  const chunkFile = resolveEntriesChunkFile({
    archive,
    relativePath,
  });

  if (!chunkFile.exists || chunkFile.size <= 0) {
    throw new DiaryImportValidationError('chunkMissing');
  }

  let value: unknown;

  try {
    value = JSON.parse(await chunkFile.text());
  } catch {
    throw new DiaryImportValidationError('chunkInvalid');
  }

  return validateDiaryBackupChunk(value);
};

export const resolveDiaryImportPhotoUri = ({
  archive,
  entry,
}: {
  archive: DiaryValidatedBackupArchive;
  entry: DiaryBackupEntry;
}): string | null => {
  if (archive.manifest.exportType === 'lightweightBackup') {
    if (entry.photoFileName !== null) {
      throw new DiaryImportValidationError('entryInvalid');
    }

    return null;
  }

  if (entry.photoFileName === null) {
    return null;
  }

  return new File(
    new Directory(archive.payloadUri, 'photos'),
    entry.photoFileName
  ).uri;
};
