import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { DiaryPhotoError } from './DiaryPhotoError';
import {
  type DiaryPhotoDraft,
  type PreparedDiaryPhoto,
  type PreparedDiaryPhotoRemoval,
} from './diaryPhotoService.types';

const MAXIMUM_EDGE = 1280;
const JPEG_QUALITY = 0.85;
const MAXIMUM_FILE_SIZE = 10 * 1024 * 1024;
const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

const deleteFileIfExists = (file: File): void => {
  if (file.exists) {
    file.delete();
  }
};

const safelyDeleteFile = (file: File | null): void => {
  if (file === null) {
    return;
  }

  try {
    deleteFileIfExists(file);
  } catch {
    return;
  }
};

const validateIdentifier = (value: string): void => {
  if (!SAFE_IDENTIFIER_PATTERN.test(value)) {
    throw new DiaryPhotoError('storageFailed');
  }
};

const validatePhotoFile = (file: File): void => {
  if (!file.exists || file.size <= 0) {
    throw new DiaryPhotoError('invalidFile');
  }

  if (file.size > MAXIMUM_FILE_SIZE) {
    throw new DiaryPhotoError('fileTooLarge');
  }
};

const createBackupFile = (entryId: string): File => {
  const backupDirectory = new Directory(Paths.cache, 'diary-photo-backups');

  backupDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new File(backupDirectory, `${entryId}-${suffix}.jpg`);
};

const createDiaryPhotoFile = ({
  userId,
  entryId,
}: {
  userId: string;
  entryId: string;
}): File => {
  const photoDirectory = new Directory(
    Paths.document,
    'users',
    userId,
    'diaryPhotos'
  );

  return new File(photoDirectory, `${entryId}.jpg`);
};

export const createDiaryPhotoDraft = async (
  sourceUri: string
): Promise<DiaryPhotoDraft> => {
  if (sourceUri.length === 0) {
    throw new DiaryPhotoError('invalidFile');
  }

  let draftFile: File | null = null;

  try {
    const sourceContext = ImageManipulator.manipulate(sourceUri);

    const sourceImage = await sourceContext.renderAsync();

    const longestEdge = Math.max(sourceImage.width, sourceImage.height);

    let outputImage = sourceImage;

    if (longestEdge > MAXIMUM_EDGE) {
      const resizeContext = ImageManipulator.manipulate(sourceImage);

      if (sourceImage.width >= sourceImage.height) {
        resizeContext.resize({
          width: MAXIMUM_EDGE,
          height: null,
        });
      } else {
        resizeContext.resize({
          width: null,
          height: MAXIMUM_EDGE,
        });
      }

      outputImage = await resizeContext.renderAsync();
    }

    const result = await outputImage.saveAsync({
      format: SaveFormat.JPEG,
      compress: JPEG_QUALITY,
    });

    draftFile = new File(result.uri);

    validatePhotoFile(draftFile);

    return {
      uri: draftFile.uri,
      width: result.width,
      height: result.height,
      size: draftFile.size,
    };
  } catch (error) {
    safelyDeleteFile(draftFile);

    if (error instanceof DiaryPhotoError) {
      throw error;
    }

    throw new DiaryPhotoError('processingFailed');
  }
};

export const removeDiaryPhotoDraft = (draftUri: string | null): void => {
  if (draftUri === null) {
    return;
  }

  try {
    deleteFileIfExists(new File(draftUri));
  } catch {
    throw new DiaryPhotoError('storageFailed');
  }
};

export const prepareDiaryPhotoForEntry = ({
  userId,
  entryId,
  draftUri,
}: {
  userId: string;
  entryId: string;
  draftUri: string;
}): PreparedDiaryPhoto => {
  validateIdentifier(userId);
  validateIdentifier(entryId);

  const draftFile = new File(draftUri);

  validatePhotoFile(draftFile);

  const photoDirectory = new Directory(
    Paths.document,
    'users',
    userId,
    'diaryPhotos'
  );

  const destinationFile = createDiaryPhotoFile({
    userId,
    entryId,
  });

  const hadExistingDestination = destinationFile.exists;

  let backupFile: File | null = null;
  let backupReady = false;

  try {
    photoDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    if (draftFile.uri === destinationFile.uri) {
      throw new DiaryPhotoError('storageFailed');
    }

    if (hadExistingDestination) {
      backupFile = createBackupFile(entryId);

      destinationFile.copy(backupFile);

      validatePhotoFile(backupFile);

      backupReady = true;

      destinationFile.delete();
    }

    draftFile.copy(destinationFile);

    validatePhotoFile(destinationFile);
  } catch (error) {
    try {
      if (backupReady && backupFile !== null) {
        deleteFileIfExists(destinationFile);

        backupFile.copy(destinationFile);

        backupFile.delete();
      } else if (!hadExistingDestination) {
        deleteFileIfExists(destinationFile);
      }

      safelyDeleteFile(backupFile);
    } catch {
      throw new DiaryPhotoError('storageFailed');
    }

    if (error instanceof DiaryPhotoError) {
      throw error;
    }

    throw new DiaryPhotoError('storageFailed');
  }

  let active = true;

  const finalize = (): void => {
    if (!active) {
      return;
    }

    safelyDeleteFile(backupFile);
    safelyDeleteFile(draftFile);

    active = false;
  };

  const rollback = (): void => {
    if (!active) {
      return;
    }

    try {
      deleteFileIfExists(destinationFile);

      if (backupReady && backupFile !== null) {
        backupFile.copy(destinationFile);

        backupFile.delete();
      }

      active = false;
    } catch {
      throw new DiaryPhotoError('storageFailed');
    }
  };

  return {
    localPhotoUri: destinationFile.uri,

    photoPath: `users/${userId}/diaryPhotos/${entryId}.jpg`,

    finalize,
    rollback,
  };
};

export const prepareDiaryPhotoRemoval = ({
  userId,
  entryId,
}: {
  userId: string;
  entryId: string;
}): PreparedDiaryPhotoRemoval => {
  validateIdentifier(userId);
  validateIdentifier(entryId);

  const photoFile = createDiaryPhotoFile({
    userId,
    entryId,
  });

  if (!photoFile.exists) {
    return {
      finalize: () => undefined,
      rollback: () => undefined,
    };
  }

  let backupFile: File | null = null;

  try {
    backupFile = createBackupFile(entryId);

    photoFile.copy(backupFile);

    validatePhotoFile(backupFile);

    photoFile.delete();
  } catch {
    safelyDeleteFile(backupFile);

    throw new DiaryPhotoError('storageFailed');
  }

  let active = true;

  const finalize = (): void => {
    if (!active) {
      return;
    }

    safelyDeleteFile(backupFile);

    active = false;
  };

  const rollback = (): void => {
    if (!active || backupFile === null) {
      return;
    }

    try {
      deleteFileIfExists(photoFile);

      backupFile.copy(photoFile);

      validatePhotoFile(photoFile);

      backupFile.delete();

      active = false;
    } catch {
      throw new DiaryPhotoError('storageFailed');
    }
  };

  return {
    finalize,
    rollback,
  };
};
