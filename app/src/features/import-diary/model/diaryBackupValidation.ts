import {
  DIARY_BACKUP_APP,
  DIARY_BACKUP_CHUNK_SIZE,
  DIARY_BACKUP_FORMAT_VERSION,
  type DiaryBackupEntry,
  type DiaryBackupManifest,
  type DiaryBackupRecordsScope,
  isMealRelation,
  validateDiaryEntryEditableValues,
} from '@entities/diary';

export type DiaryImportValidationErrorCode =
  | 'unsupportedPlatform'
  | 'invalidArchive'
  | 'manifestMissing'
  | 'manifestInvalid'
  | 'unsupportedVersion'
  | 'unsafePath'
  | 'chunkMissing'
  | 'chunkInvalid'
  | 'entryInvalid'
  | 'duplicateEntryId'
  | 'entryCountMismatch';

export class DiaryImportValidationError extends Error {
  public constructor(public readonly code: DiaryImportValidationErrorCode) {
    super(code);
    this.name = 'DiaryImportValidationError';
  }
}

export const isDiaryImportValidationError = (
  error: unknown
): error is DiaryImportValidationError =>
  error instanceof DiaryImportValidationError;

export type DiaryValidatedBackupArchive = {
  sourceFileName: string;
  payloadUri: string;

  manifest: DiaryBackupManifest;

  entryIds: readonly string[];

  cleanup: () => void;
};

const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

const SAFE_CHUNK_PATH_PATTERN = /^entries\/entries_\d{6}\.json$/;

const STRICT_ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isNullableNumber = (value: unknown): value is number | null =>
  value === null || typeof value === 'number';

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const parseStrictIsoDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !STRICT_ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    return null;
  }

  return date;
};

export const isSafeDiaryBackupRelativePath = (value: string): boolean => {
  if (
    value.length === 0 ||
    value.startsWith('/') ||
    value.startsWith('\\') ||
    value.includes('\\') ||
    value.includes('\0') ||
    /^[A-Za-z]:/.test(value)
  ) {
    return false;
  }

  const segments = value.split('/');

  return segments.every(
    (segment) => segment.length > 0 && segment !== '.' && segment !== '..'
  );
};

const isRecordsScope = (value: unknown): value is DiaryBackupRecordsScope => {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }

  if (value.type === 'all' || value.type === 'selected') {
    return true;
  }

  if (value.type !== 'period') {
    return false;
  }

  const from = parseStrictIsoDate(value.from);
  const to = parseStrictIsoDate(value.to);

  return from !== null && to !== null && from.getTime() <= to.getTime();
};

const areChunksValid = (value: unknown): value is string[] => {
  if (
    !Array.isArray(value) ||
    value.some(
      (item) =>
        typeof item !== 'string' ||
        !isSafeDiaryBackupRelativePath(item) ||
        !SAFE_CHUNK_PATH_PATTERN.test(item)
    )
  ) {
    return false;
  }

  return new Set(value).size === value.length;
};

export const parseDiaryBackupManifest = (
  value: unknown
): DiaryBackupManifest => {
  if (!isRecord(value)) {
    throw new DiaryImportValidationError('manifestInvalid');
  }

  const {
    app,
    formatVersion,
    exportType,
    exportedAt,
    sourceUserName,
    sourceUserId,
    entriesCount,
    photosCount,
    withPhotos,
    recordsScope,
    chunks,
  } = value;

  if (typeof formatVersion !== 'number' || !Number.isInteger(formatVersion)) {
    throw new DiaryImportValidationError('manifestInvalid');
  }

  if (formatVersion !== DIARY_BACKUP_FORMAT_VERSION) {
    throw new DiaryImportValidationError('unsupportedVersion');
  }

  if (
    app !== DIARY_BACKUP_APP ||
    typeof exportedAt !== 'string' ||
    parseStrictIsoDate(exportedAt) === null ||
    !isNonEmptyString(sourceUserName) ||
    !isNonEmptyString(sourceUserId) ||
    !isNonNegativeInteger(entriesCount) ||
    !isNonNegativeInteger(photosCount) ||
    !isRecordsScope(recordsScope) ||
    !areChunksValid(chunks)
  ) {
    throw new DiaryImportValidationError('manifestInvalid');
  }

  if (exportType === 'fullBackup' && withPhotos === true) {
    return {
      app: DIARY_BACKUP_APP,
      formatVersion: DIARY_BACKUP_FORMAT_VERSION,
      exportType: 'fullBackup',
      exportedAt,
      sourceUserName,
      sourceUserId,
      entriesCount,
      photosCount,
      withPhotos: true,
      recordsScope,
      chunks,
    };
  }

  if (
    exportType === 'lightweightBackup' &&
    withPhotos === false &&
    photosCount === 0
  ) {
    return {
      app: DIARY_BACKUP_APP,
      formatVersion: DIARY_BACKUP_FORMAT_VERSION,
      exportType: 'lightweightBackup',
      exportedAt,
      sourceUserName,
      sourceUserId,
      entriesCount,
      photosCount: 0,
      withPhotos: false,
      recordsScope,
      chunks,
    };
  }

  throw new DiaryImportValidationError('manifestInvalid');
};

const isPhotoFileNameValid = (entryId: string, value: unknown): boolean => {
  if (value === null) {
    return true;
  }

  return (
    typeof value === 'string' &&
    isSafeDiaryBackupRelativePath(value) &&
    !value.includes('/') &&
    value === `${entryId}.jpg`
  );
};

export const isDiaryBackupEntry = (
  value: unknown
): value is DiaryBackupEntry => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    glucose,
    mealRelation,
    shortInsulin,
    longInsulin,
    carbsGram,
    comment,
    aiAnalysis,
    photoFileName,
    photoUrl,
    eventAt,
  } = value;

  if (
    !isNonEmptyString(id) ||
    !SAFE_IDENTIFIER_PATTERN.test(id) ||
    !isNullableNumber(glucose) ||
    !isNullableNumber(shortInsulin) ||
    !isNullableNumber(longInsulin) ||
    !isNullableNumber(carbsGram) ||
    !(
      mealRelation === null ||
      (typeof mealRelation === 'string' && isMealRelation(mealRelation))
    ) ||
    typeof comment !== 'string' ||
    typeof aiAnalysis !== 'string' ||
    !isNullableString(photoUrl) ||
    !isPhotoFileNameValid(id, photoFileName) ||
    typeof eventAt !== 'string'
  ) {
    return false;
  }

  const parsedEventAt = parseStrictIsoDate(eventAt);

  if (parsedEventAt === null) {
    return false;
  }

  const validationError = validateDiaryEntryEditableValues({
    values: {
      glucose,
      mealRelation,
      shortInsulin,
      longInsulin,
      carbsGram,
      comment,
      eventAt: parsedEventAt,
    },
    hasPhoto:
      photoFileName !== null || (photoUrl !== null && photoUrl.length > 0),
  });

  return validationError === null;
};

export const validateDiaryBackupChunk = (
  value: unknown
): readonly DiaryBackupEntry[] => {
  if (!Array.isArray(value) || value.length > DIARY_BACKUP_CHUNK_SIZE) {
    throw new DiaryImportValidationError('chunkInvalid');
  }

  if (value.some((entry) => !isDiaryBackupEntry(entry))) {
    throw new DiaryImportValidationError('entryInvalid');
  }

  return value;
};
