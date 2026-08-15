import { Directory, File, Paths } from 'expo-file-system';

import { PlatformOS } from '@shared/lib/platform';

import {
  DiaryImportValidationError,
  type DiaryValidatedBackupArchive,
  isSafeDiaryBackupRelativePath,
  parseDiaryBackupManifest,
  validateDiaryBackupChunk,
} from '../model/diaryBackupValidation';

const IMPORT_TEMP_DIRECTORY_NAME = 'diaryImport';

const MANIFEST_FILE_NAME = 'manifest.json';

const SAFE_ARCHIVE_FILE_NAME_PATTERN = /^[^/\\]+\.zip$/i;

const createSessionId = (): string =>
  [Date.now().toString(36), Math.random().toString(36).slice(2, 12)].join('_');

const safelyDeleteDirectory = (directory: Directory): void => {
  try {
    if (directory.exists) {
      directory.delete();
    }
  } catch {
    return;
  }
};

const readJsonFile = async (
  file: File,
  errorCode: 'manifestInvalid' | 'chunkInvalid'
): Promise<unknown> => {
  if (!file.exists || file.size <= 0) {
    throw new DiaryImportValidationError(errorCode);
  }

  try {
    return JSON.parse(await file.text());
  } catch {
    throw new DiaryImportValidationError(errorCode);
  }
};

const resolveChunkFile = ({
  payloadDirectory,
  relativePath,
}: {
  payloadDirectory: Directory;
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

  return new File(new Directory(payloadDirectory, directoryName), fileName);
};

export const validateDiaryBackupArchive = async ({
  fileUri,
  fileName,
}: {
  fileUri: string;
  fileName: string;
}): Promise<DiaryValidatedBackupArchive> => {
  if (PlatformOS.WEB) {
    throw new DiaryImportValidationError('unsupportedPlatform');
  }

  if (!SAFE_ARCHIVE_FILE_NAME_PATTERN.test(fileName)) {
    throw new DiaryImportValidationError('invalidArchive');
  }

  const sourceFile = new File(fileUri);

  if (!sourceFile.exists || sourceFile.size <= 0) {
    throw new DiaryImportValidationError('invalidArchive');
  }

  const importRootDirectory = new Directory(
    Paths.cache,
    IMPORT_TEMP_DIRECTORY_NAME
  );

  importRootDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const sessionDirectory = new Directory(
    importRootDirectory,
    createSessionId()
  );

  sessionDirectory.create({
    idempotent: false,
    intermediates: true,
  });

  const payloadDirectory = new Directory(sessionDirectory, 'payload');

  payloadDirectory.create({
    idempotent: false,
    intermediates: true,
  });

  let completed = false;

  try {
    const { unzip } = await import('react-native-zip-archive');

    try {
      await unzip(sourceFile.uri, payloadDirectory.uri);
    } catch {
      throw new DiaryImportValidationError('invalidArchive');
    }

    const manifestFile = new File(payloadDirectory, MANIFEST_FILE_NAME);

    if (!manifestFile.exists) {
      throw new DiaryImportValidationError('manifestMissing');
    }

    const manifest = parseDiaryBackupManifest(
      await readJsonFile(manifestFile, 'manifestInvalid')
    );

    const entryIds: string[] = [];
    const seenEntryIds = new Set<string>();

    let actualEntriesCount = 0;

    for (const relativeChunkPath of manifest.chunks) {
      const chunkFile = resolveChunkFile({
        payloadDirectory,
        relativePath: relativeChunkPath,
      });

      if (!chunkFile.exists || chunkFile.size <= 0) {
        throw new DiaryImportValidationError('chunkMissing');
      }

      const entries = validateDiaryBackupChunk(
        await readJsonFile(chunkFile, 'chunkInvalid')
      );

      for (const entry of entries) {
        if (seenEntryIds.has(entry.id)) {
          throw new DiaryImportValidationError('duplicateEntryId');
        }

        seenEntryIds.add(entry.id);
        entryIds.push(entry.id);
      }

      actualEntriesCount += entries.length;
    }

    if (actualEntriesCount !== manifest.entriesCount) {
      throw new DiaryImportValidationError('entryCountMismatch');
    }

    completed = true;

    let active = true;

    return {
      sourceFileName: fileName,
      payloadUri: payloadDirectory.uri,
      manifest,
      entryIds,
      cleanup: () => {
        if (!active) {
          return;
        }

        active = false;

        safelyDeleteDirectory(sessionDirectory);
      },
    };
  } finally {
    if (!completed) {
      safelyDeleteDirectory(sessionDirectory);
    }
  }
};
