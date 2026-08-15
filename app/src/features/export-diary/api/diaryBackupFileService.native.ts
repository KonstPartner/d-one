import { Directory, File } from 'expo-file-system';
import { zip } from 'react-native-zip-archive';

import {
  createDiaryStoredExportTargetUri,
  DIARY_BACKUP_CHUNK_SIZE,
} from '@entities/diary';

import type { DiaryBackupFileSession } from './diaryBackupFileService.types';

const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;
const SAFE_ARCHIVE_FILE_NAME_PATTERN = /^[^/\\]+\.zip$/i;

const STAGING_ARCHIVE_FILE_NAME = 'archive-staging.zip';

export type DiaryBackupPersistentFileSession = DiaryBackupFileSession & {
  resetBatch: (input: {
    chunkNumber: number;
    entryIds: readonly string[];
  }) => void;
};

type CreateDiaryBackupFileSessionInput = {
  payloadUri: string;
};

const safelyDeleteFile = (file: File): void => {
  try {
    if (file.exists) {
      file.delete();
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

export const createDiaryBackupFileSession = ({
  payloadUri,
}: CreateDiaryBackupFileSessionInput): DiaryBackupPersistentFileSession => {
  if (payloadUri.length === 0) {
    throw new Error('Diary backup payload is missing');
  }

  const payloadDirectory = new Directory(payloadUri);

  if (!payloadDirectory.exists) {
    throw new Error('Diary backup payload does not exist');
  }

  const workingDirectory = payloadDirectory.parentDirectory;

  const entriesDirectory = new Directory(payloadDirectory, 'entries');
  const photosDirectory = new Directory(payloadDirectory, 'photos');

  entriesDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const stagingArchiveFile = new File(
    workingDirectory,
    STAGING_ARCHIVE_FILE_NAME
  );

  let active = true;

  const assertActive = (): void => {
    if (!active) {
      throw new Error('Diary backup file session is closed');
    }
  };

  const resetBatch: DiaryBackupPersistentFileSession['resetBatch'] = ({
    chunkNumber,
    entryIds,
  }) => {
    assertActive();
    assertValidChunkNumber(chunkNumber);

    if (
      entryIds.length === 0 ||
      entryIds.length > DIARY_BACKUP_CHUNK_SIZE ||
      entryIds.some((entryId) => !SAFE_IDENTIFIER_PATTERN.test(entryId))
    ) {
      throw new Error('Invalid diary backup batch');
    }

    safelyDeleteFile(
      new File(entriesDirectory, createChunkFileName(chunkNumber))
    );

    entryIds.forEach((entryId) => {
      safelyDeleteFile(new File(photosDirectory, `${entryId}.jpg`));
    });
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

    const manifestFile = new File(payloadDirectory, 'manifest.json');

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
  ) => {
    assertActive();

    if (!SAFE_ARCHIVE_FILE_NAME_PATTERN.test(fileName)) {
      throw new Error('Invalid diary backup archive file name');
    }

    const manifestFile = new File(payloadDirectory, 'manifest.json');

    if (!manifestFile.exists || manifestFile.size <= 0) {
      throw new Error('Diary backup manifest is missing');
    }

    safelyDeleteFile(stagingArchiveFile);

    try {
      await zip(payloadDirectory.uri, stagingArchiveFile.uri);
    } catch {
      safelyDeleteFile(stagingArchiveFile);

      throw new Error('Diary backup archive cannot be created');
    }

    if (!stagingArchiveFile.exists || stagingArchiveFile.size <= 0) {
      safelyDeleteFile(stagingArchiveFile);

      throw new Error('Diary backup archive is empty');
    }

    const archiveSize = stagingArchiveFile.size;
    const archiveFile = new File(createDiaryStoredExportTargetUri(fileName));

    try {
      stagingArchiveFile.move(archiveFile);
    } catch {
      if (archiveFile.exists && archiveFile.size === archiveSize) {
        active = false;

        return {
          fileUri: archiveFile.uri,
          fileSize: archiveFile.size,
        };
      }

      safelyDeleteFile(archiveFile);

      throw new Error('Diary backup archive cannot be finalized');
    }

    if (!archiveFile.exists || archiveFile.size !== archiveSize) {
      safelyDeleteFile(archiveFile);

      throw new Error('Diary backup archive cannot be finalized');
    }

    active = false;

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

    safelyDeleteFile(stagingArchiveFile);
  };

  return {
    resetBatch,
    addLocalPhoto,
    writeEntriesChunk,
    writeManifest,
    createArchive,
    cleanupWorkingFiles,
  };
};
