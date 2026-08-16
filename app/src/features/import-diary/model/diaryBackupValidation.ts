import {
  DIARY_BACKUP_APP,
  DIARY_BACKUP_CHUNK_SIZE,
  DIARY_BACKUP_FORMAT_VERSION,
  DIARY_BACKUP_SUPPORTED_FORMAT_VERSIONS,
  type DiaryBackupEntry,
  type DiaryBackupFormatVersion,
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

const isSupportedFormatVersion = (
  value: number
): value is DiaryBackupFormatVersion =>
  DIARY_BACKUP_SUPPORTED_FORMAT_VERSIONS.some(
    (supportedVersion) => supportedVersion === value
  );

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

  if (!isSupportedFormatVersion(formatVersion)) {
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
      formatVersion,
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
      formatVersion,
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

const isPhotoFileNameValid = (
  entryId: string,
  value: string | null
): boolean => {
  if (value === null) {
    return true;
  }

  return (
    isSafeDiaryBackupRelativePath(value) &&
    !value.includes('/') &&
    value === `${entryId}.jpg`
  );
};

const parseDiaryBackupEntry = (
  value: unknown,
  formatVersion: DiaryBackupFormatVersion
): DiaryBackupEntry | null => {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    glucose,
    mealRelation,
    shortInsulin,
    ultraShortInsulin: sourceUltraShortInsulin,
    longInsulin,
    carbsGram,
    comment,
    aiAnalysis,
    photoFileName,
    photoUrl,
    eventAt,
  } = value;

  const ultraShortInsulin =
    formatVersion === 1 ? null : sourceUltraShortInsulin;

  if (
    !isNonEmptyString(id) ||
    !SAFE_IDENTIFIER_PATTERN.test(id) ||
    !isNullableNumber(glucose) ||
    !isNullableNumber(shortInsulin) ||
    !isNullableNumber(ultraShortInsulin) ||
    !isNullableNumber(longInsulin) ||
    !isNullableNumber(carbsGram) ||
    !(
      mealRelation === null ||
      (typeof mealRelation === 'string' && isMealRelation(mealRelation))
    ) ||
    typeof comment !== 'string' ||
    typeof aiAnalysis !== 'string' ||
    !isNullableString(photoFileName) ||
    !isNullableString(photoUrl) ||
    typeof eventAt !== 'string'
  ) {
    return null;
  }

  if (!isPhotoFileNameValid(id, photoFileName)) {
    return null;
  }

  const parsedEventAt = parseStrictIsoDate(eventAt);

  if (parsedEventAt === null) {
    return null;
  }

  const validationError = validateDiaryEntryEditableValues({
    values: {
      glucose,
      mealRelation,
      shortInsulin,
      ultraShortInsulin,
      longInsulin,
      carbsGram,
      comment,
      eventAt: parsedEventAt,
    },
    hasPhoto:
      photoFileName !== null || (photoUrl !== null && photoUrl.length > 0),
  });

  if (validationError !== null) {
    return null;
  }

  return {
    id,
    glucose,
    mealRelation,
    shortInsulin,
    ultraShortInsulin,
    longInsulin,
    carbsGram,
    comment,
    aiAnalysis,
    photoFileName,
    photoUrl,
    eventAt,
  };
};

export const isDiaryBackupEntry = (value: unknown): value is DiaryBackupEntry =>
  parseDiaryBackupEntry(value, DIARY_BACKUP_FORMAT_VERSION) !== null;

export const validateDiaryBackupChunk = (
  value: unknown,
  formatVersion: DiaryBackupFormatVersion = DIARY_BACKUP_FORMAT_VERSION
): readonly DiaryBackupEntry[] => {
  if (!Array.isArray(value) || value.length > DIARY_BACKUP_CHUNK_SIZE) {
    throw new DiaryImportValidationError('chunkInvalid');
  }

  const entries: DiaryBackupEntry[] = [];

  for (const valueEntry of value) {
    const entry = parseDiaryBackupEntry(valueEntry, formatVersion);

    if (entry === null) {
      throw new DiaryImportValidationError('entryInvalid');
    }

    entries.push(entry);
  }

  return entries;
};
