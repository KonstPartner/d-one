import { Directory, File, Paths } from 'expo-file-system';
import { zip } from 'react-native-zip-archive';

import { DIARY_BACKUP_CHUNK_SIZE } from '@entities/diary';

import type {
  DiaryBackupArchiveResult,
  DiaryBackupFileSession,
} from './diaryBackupFileService.types';

const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;
const SAFE_ARCHIVE_FILE_NAME_PATTERN = /^[^/\\]+\.zip$/i;

const TEMP_DIRECTORY_NAME = 'tmp';
const EXPORT_RESULT_DIRECTORY_NAME = 'diary-export-results';

const createUniqueSessionName = (): string =>
  `export_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const safelyDeleteFile = (file: File): void => {
  try {
    if (file.exists) {
      file.delete();
    }
  } catch {
    return;
  }
};

const safelyDeleteDirectory = (directory: Directory): void => {
  try {
    if (directory.exists) {
      directory.delete();
    }
  } catch {
    return;
  }
};

const assertValidChunkNumber = (chunkNumber: number): void => {
  if (!Number.isInteger(chunkNumber) || chunkNumber < 1) {
    throw new Error('Invalid diary backup chunk number');
  }
};

const createChunkFileName = (chunkNumber: number): string =>
  `entries_${chunkNumber.toString().padStart(6, '0')}.json`;

export const createDiaryBackupFileSession = (): DiaryBackupFileSession => {
  const workingDirectory = new Directory(
    Paths.document,
    TEMP_DIRECTORY_NAME,
    createUniqueSessionName()
  );

  const entriesDirectory = new Directory(workingDirectory, 'entries');
  const photosDirectory = new Directory(workingDirectory, 'photos');

  workingDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  entriesDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  let active = true;

  const assertActive = (): void => {
    if (!active) {
      throw new Error('Diary backup file session is closed');
    }
  };

  const addLocalPhoto: DiaryBackupFileSession['addLocalPhoto'] = ({
    entryId,
    localPhotoUri,
  }) => {
    assertActive();

    if (localPhotoUri === null || !SAFE_IDENTIFIER_PATTERN.test(entryId)) {
      return null;
    }

    const sourceFile = new File(localPhotoUri);

    if (!sourceFile.exists || sourceFile.size <= 0) {
      return null;
    }

    const photoFileName = `${entryId}.jpg`;

    photosDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    const destinationFile = new File(photosDirectory, photoFileName);

    try {
      safelyDeleteFile(destinationFile);

      sourceFile.copy(destinationFile);

      if (!destinationFile.exists || destinationFile.size <= 0) {
        safelyDeleteFile(destinationFile);

        return null;
      }

      return photoFileName;
    } catch {
      safelyDeleteFile(destinationFile);

      return null;
    }
  };

  const writeEntriesChunk: DiaryBackupFileSession['writeEntriesChunk'] = ({
    chunkNumber,
    entries,
  }) => {
    assertActive();
    assertValidChunkNumber(chunkNumber);

    if (entries.length === 0 || entries.length > DIARY_BACKUP_CHUNK_SIZE) {
      throw new Error('Invalid diary backup chunk size');
    }

    const chunkFileName = createChunkFileName(chunkNumber);
    const chunkFile = new File(entriesDirectory, chunkFileName);

    chunkFile.create({
      overwrite: true,
      intermediates: true,
    });

    chunkFile.write(JSON.stringify(entries));

    if (!chunkFile.exists || chunkFile.size <= 0) {
      throw new Error(`Diary backup chunk cannot be written: ${chunkFileName}`);
    }

    return `entries/${chunkFileName}`;
  };

  const writeManifest: DiaryBackupFileSession['writeManifest'] = (manifest) => {
    assertActive();

    const manifestFile = new File(workingDirectory, 'manifest.json');

    manifestFile.create({
      overwrite: true,
      intermediates: true,
    });

    manifestFile.write(JSON.stringify(manifest, null, 2));

    if (!manifestFile.exists || manifestFile.size <= 0) {
      throw new Error('Diary backup manifest cannot be written');
    }
  };

  const createArchive: DiaryBackupFileSession['createArchive'] = async (
    fileName
  ): Promise<DiaryBackupArchiveResult> => {
    assertActive();

    if (!SAFE_ARCHIVE_FILE_NAME_PATTERN.test(fileName)) {
      throw new Error('Invalid diary backup archive file name');
    }

    const manifestFile = new File(workingDirectory, 'manifest.json');

    if (!manifestFile.exists || manifestFile.size <= 0) {
      throw new Error('Diary backup manifest is missing');
    }

    const resultDirectory = new Directory(
      Paths.cache,
      EXPORT_RESULT_DIRECTORY_NAME
    );

    resultDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    const archiveFile = new File(resultDirectory, fileName);

    safelyDeleteFile(archiveFile);

    try {
      await zip(workingDirectory.uri, archiveFile.uri);
    } catch {
      safelyDeleteFile(archiveFile);

      throw new Error('Diary backup archive cannot be created');
    }

    if (!archiveFile.exists || archiveFile.size <= 0) {
      safelyDeleteFile(archiveFile);

      throw new Error('Diary backup archive is empty');
    }

    return {
      fileUri: archiveFile.uri,
      fileSize: archiveFile.size,
    };
  };

  const cleanupWorkingFiles = (): void => {
    if (!active) {
      return;
    }

    active = false;

    safelyDeleteDirectory(workingDirectory);
  };

  return {
    addLocalPhoto,
    writeEntriesChunk,
    writeManifest,
    createArchive,
    cleanupWorkingFiles,
  };
};

export const removeDiaryExportFile = (fileUri: string): void => {
  if (fileUri.length === 0) {
    return;
  }

  safelyDeleteFile(new File(fileUri));
};
