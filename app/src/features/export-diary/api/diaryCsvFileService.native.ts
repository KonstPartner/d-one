import { Directory, File } from 'expo-file-system';

import { createDiaryStoredExportTargetUri } from '@entities/diary';

import type {
  DiaryCsvFileResult,
  DiaryCsvFileSession,
} from '../model/diaryCsv';

const SAFE_CSV_FILE_NAME_PATTERN = /^[^/\\]+\.csv$/i;

const CSV_DIRECTORY_NAME = 'csv';
const STAGING_FILE_NAME = 'csv-staging.csv';

const UTF8_BOM = '\uFEFF';

const textEncoder = new TextEncoder();

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
    throw new Error('Invalid diary CSV chunk number');
  }
};

const createChunkFileName = (chunkNumber: number): string =>
  `rows_${chunkNumber.toString().padStart(6, '0')}.csv`;

export const createDiaryCsvFileSession = ({
  payloadUri,
  headerRow,
}: {
  payloadUri: string;
  headerRow: string;
}): DiaryCsvFileSession => {
  if (payloadUri.length === 0) {
    throw new Error('Diary CSV payload is missing');
  }

  if (headerRow.length === 0) {
    throw new Error('Diary CSV header is missing');
  }

  const payloadDirectory = new Directory(payloadUri);

  if (!payloadDirectory.exists) {
    throw new Error('Diary CSV payload does not exist');
  }

  const workingDirectory = payloadDirectory.parentDirectory;

  const csvDirectory = new Directory(payloadDirectory, CSV_DIRECTORY_NAME);

  csvDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const stagingFile = new File(workingDirectory, STAGING_FILE_NAME);

  let active = true;

  const assertActive = (): void => {
    if (!active) {
      throw new Error('Diary CSV file session is closed');
    }
  };

  const resetChunk: DiaryCsvFileSession['resetChunk'] = (chunkNumber) => {
    assertActive();
    assertValidChunkNumber(chunkNumber);

    safelyDeleteFile(new File(csvDirectory, createChunkFileName(chunkNumber)));
  };

  const writeRowsChunk: DiaryCsvFileSession['writeRowsChunk'] = ({
    chunkNumber,
    rows,
  }) => {
    assertActive();
    assertValidChunkNumber(chunkNumber);

    const chunkFile = new File(csvDirectory, createChunkFileName(chunkNumber));

    chunkFile.create({
      overwrite: true,
      intermediates: true,
    });

    const content = rows.length === 0 ? '' : `${rows.join('\r\n')}\r\n`;

    chunkFile.write(content);

    if (!chunkFile.exists) {
      throw new Error('Diary CSV chunk cannot be written');
    }

    if (rows.length > 0 && chunkFile.size <= 0) {
      throw new Error('Diary CSV chunk is empty');
    }
  };

  const createResultFile: DiaryCsvFileSession['createResultFile'] = ({
    fileName,
    chunksCount,
  }): DiaryCsvFileResult => {
    assertActive();

    if (!SAFE_CSV_FILE_NAME_PATTERN.test(fileName)) {
      throw new Error('Invalid diary CSV file name');
    }

    if (!Number.isInteger(chunksCount) || chunksCount < 0) {
      throw new Error('Invalid diary CSV chunks count');
    }

    safelyDeleteFile(stagingFile);

    stagingFile.create({
      overwrite: true,
      intermediates: false,
    });

    const fileHandle = stagingFile.open();

    try {
      fileHandle.writeBytes(textEncoder.encode(`${UTF8_BOM}${headerRow}\r\n`));

      for (let chunkNumber = 1; chunkNumber <= chunksCount; chunkNumber += 1) {
        const chunkFile = new File(
          csvDirectory,
          createChunkFileName(chunkNumber)
        );

        if (!chunkFile.exists) {
          throw new Error(`Diary CSV chunk is missing: ${chunkNumber}`);
        }

        if (chunkFile.size > 0) {
          fileHandle.writeBytes(textEncoder.encode(chunkFile.textSync()));
        }
      }
    } catch (error) {
      try {
        fileHandle.close();
      } finally {
        safelyDeleteFile(stagingFile);
      }

      throw error;
    }

    fileHandle.close();

    if (!stagingFile.exists || stagingFile.size <= 0) {
      safelyDeleteFile(stagingFile);

      throw new Error('Diary CSV result file is empty');
    }

    const resultSize = stagingFile.size;
    const resultFile = new File(createDiaryStoredExportTargetUri(fileName));

    try {
      stagingFile.move(resultFile);
    } catch {
      if (resultFile.exists && resultFile.size === resultSize) {
        active = false;

        return {
          fileUri: resultFile.uri,
          fileSize: resultFile.size,
        };
      }

      safelyDeleteFile(resultFile);

      throw new Error('Diary CSV result file cannot be finalized');
    }

    if (!resultFile.exists || resultFile.size !== resultSize) {
      safelyDeleteFile(resultFile);

      throw new Error('Diary CSV result file cannot be finalized');
    }

    active = false;

    return {
      fileUri: resultFile.uri,
      fileSize: resultFile.size,
    };
  };

  const cleanupWorkingFiles = (): void => {
    if (!active) {
      return;
    }

    active = false;

    safelyDeleteFile(stagingFile);
  };

  return {
    resetChunk,
    writeRowsChunk,
    createResultFile,
    cleanupWorkingFiles,
  };
};
