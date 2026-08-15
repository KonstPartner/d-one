import { Directory, File, Paths } from 'expo-file-system';

import type {
  DiaryCsvFileResult,
  DiaryCsvFileSession,
} from '../model/diaryCsv';

const SAFE_CSV_FILE_NAME_PATTERN = /^[^/\\]+\.csv$/i;

const TEMP_DIRECTORY_NAME = 'tmp';
const EXPORT_RESULT_DIRECTORY_NAME = 'diary-export-results';

const UTF8_BOM = '\uFEFF';

const textEncoder = new TextEncoder();

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

export const createDiaryCsvFileSession = ({
  headerRow,
}: {
  headerRow: string;
}): DiaryCsvFileSession => {
  const workingDirectory = new Directory(
    Paths.document,
    TEMP_DIRECTORY_NAME,
    createUniqueSessionName()
  );

  workingDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const workingFile = new File(workingDirectory, 'export.csv');

  workingFile.create({
    overwrite: true,
    intermediates: true,
  });

  const fileHandle = workingFile.open();

  let active = true;
  let handleClosed = false;

  const assertActive = (): void => {
    if (!active) {
      throw new Error('Diary CSV file session is closed');
    }
  };

  const closeHandle = (): void => {
    if (handleClosed) {
      return;
    }

    fileHandle.close();
    handleClosed = true;
  };

  const appendBytes = (content: string): void => {
    fileHandle.writeBytes(textEncoder.encode(content));
  };

  try {
    appendBytes(`${UTF8_BOM}${headerRow}\r\n`);
  } catch (error) {
    try {
      closeHandle();
    } finally {
      safelyDeleteDirectory(workingDirectory);
    }

    throw error;
  }

  const append: DiaryCsvFileSession['append'] = (content) => {
    assertActive();

    if (content.length === 0) {
      return;
    }

    appendBytes(content);
  };

  const createResultFile: DiaryCsvFileSession['createResultFile'] = (
    fileName
  ): DiaryCsvFileResult => {
    assertActive();

    if (!SAFE_CSV_FILE_NAME_PATTERN.test(fileName)) {
      throw new Error('Invalid diary CSV file name');
    }

    closeHandle();

    if (!workingFile.exists || workingFile.size <= 0) {
      throw new Error('Diary CSV file is empty');
    }

    const resultDirectory = new Directory(
      Paths.cache,
      EXPORT_RESULT_DIRECTORY_NAME
    );

    resultDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    const resultFile = new File(resultDirectory, fileName);

    safelyDeleteFile(resultFile);

    try {
      workingFile.copy(resultFile);
    } catch {
      safelyDeleteFile(resultFile);

      throw new Error('Diary CSV result file cannot be created');
    }

    if (!resultFile.exists || resultFile.size <= 0) {
      safelyDeleteFile(resultFile);

      throw new Error('Diary CSV result file is empty');
    }

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

    try {
      closeHandle();
    } finally {
      safelyDeleteDirectory(workingDirectory);
    }
  };

  return {
    append,
    createResultFile,
    cleanupWorkingFiles,
  };
};
