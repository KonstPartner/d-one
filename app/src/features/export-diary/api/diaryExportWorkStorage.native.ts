import { Directory, File, Paths } from 'expo-file-system';

import { DIARY_BACKUP_CHUNK_SIZE, MEAL_RELATIONS } from '@entities/diary';

import type { DiaryCsvLocalization } from '../model/diaryCsv';
import { DIARY_CSV_COLUMNS } from '../model/diaryCsv';
import {
  DIARY_EXPORT_WORK_FORMATS,
  DIARY_EXPORT_WORK_PHASES,
  DIARY_EXPORT_WORK_VERSION,
  type DiaryExportWorkFormat,
  type DiaryExportWorkPhase,
  type DiaryExportWorkPlanChunk,
  type DiaryExportWorkState,
} from '../model/diaryExportWorkState';

const EXPORTS_DIRECTORY_NAME = 'diaryExports';
const WORKING_DIRECTORY_NAME = 'working';

const STATE_FILE_NAME = 'work-state.json';
const PREVIOUS_STATE_FILE_NAME = 'work-state.previous.json';
const PLAN_DIRECTORY_NAME = 'plan';
const PAYLOAD_DIRECTORY_NAME = 'payload';

const SAFE_EXPORT_ID_PATTERN = /^export_[A-Za-z0-9_-]+$/;
const SAFE_EXPORT_FILE_NAME_PATTERN = /^[^/\\]+\.(zip|csv)$/i;
const SAFE_BACKUP_CHUNK_PATH_PATTERN = /^entries\/entries_[0-9]{6}\.json$/;

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isEntryIdList = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isNonEmptyString) &&
  new Set(value).size === value.length;

const parsePlanningSelectedEntryIds = (
  value: object
): string[] | null | undefined => {
  if (!('planningSelectedEntryIds' in value)) {
    return null;
  }

  const entryIds = value.planningSelectedEntryIds;

  if (entryIds === null) {
    return null;
  }

  if (!isEntryIdList(entryIds)) {
    return undefined;
  }

  return [...entryIds];
};

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDiaryCsvLocalization = (
  value: unknown
): value is DiaryCsvLocalization => {
  if (!isUnknownRecord(value)) {
    return false;
  }

  const { language, headers, mealRelations } = value;

  if (
    typeof language !== 'string' ||
    language.trim().length === 0 ||
    !isUnknownRecord(headers) ||
    !isUnknownRecord(mealRelations)
  ) {
    return false;
  }

  return (
    DIARY_CSV_COLUMNS.every((column) => typeof headers[column] === 'string') &&
    MEAL_RELATIONS.every(
      (mealRelation) => typeof mealRelations[mealRelation] === 'string'
    )
  );
};

const cloneDiaryCsvLocalization = (
  localization: DiaryCsvLocalization
): DiaryCsvLocalization => ({
  language: localization.language,

  headers: {
    eventAt: localization.headers.eventAt,
    glucose: localization.headers.glucose,
    mealRelation: localization.headers.mealRelation,
    shortInsulin: localization.headers.shortInsulin,
    ultraShortInsulin: localization.headers.ultraShortInsulin,
    longInsulin: localization.headers.longInsulin,
    carbsGram: localization.headers.carbsGram,
    comment: localization.headers.comment,
    aiAnalysis: localization.headers.aiAnalysis,
    photoUrl: localization.headers.photoUrl,
  },

  mealRelations: {
    beforeMeal: localization.mealRelations.beforeMeal,
    afterMeal: localization.mealRelations.afterMeal,
    fasting: localization.mealRelations.fasting,
    bedtime: localization.mealRelations.bedtime,
    night: localization.mealRelations.night,
  },
});

const parseCsvLocalization = (
  value: object
): DiaryCsvLocalization | null | undefined => {
  if (!('csvLocalization' in value)) {
    return null;
  }

  const localization = value.csvLocalization;

  if (localization === null) {
    return null;
  }

  if (!isDiaryCsvLocalization(localization)) {
    return undefined;
  }

  return cloneDiaryCsvLocalization(localization);
};

const isExportFormat = (value: unknown): value is DiaryExportWorkFormat =>
  typeof value === 'string' &&
  DIARY_EXPORT_WORK_FORMATS.some((format) => format === value);

const isExportPhase = (value: unknown): value is DiaryExportWorkPhase =>
  typeof value === 'string' &&
  DIARY_EXPORT_WORK_PHASES.some((phase) => phase === value);

const isRecordsScope = (
  value: unknown
): value is DiaryExportWorkState['recordsScope'] => {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  if (value.type === 'all' || value.type === 'selected') {
    return true;
  }

  if (
    value.type !== 'period' ||
    !('from' in value) ||
    !('to' in value) ||
    typeof value.from !== 'string' ||
    typeof value.to !== 'string'
  ) {
    return false;
  }

  const from = new Date(value.from);
  const to = new Date(value.to);

  return (
    !Number.isNaN(from.getTime()) &&
    !Number.isNaN(to.getTime()) &&
    from.getTime() <= to.getTime()
  );
};

const parseWorkState = (raw: string): DiaryExportWorkState | null => {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (
    !('version' in value) ||
    value.version !== DIARY_EXPORT_WORK_VERSION ||
    !('exportId' in value) ||
    typeof value.exportId !== 'string' ||
    !SAFE_EXPORT_ID_PATTERN.test(value.exportId) ||
    !('userId' in value) ||
    !isNonEmptyString(value.userId) ||
    !('userName' in value) ||
    !isNonEmptyString(value.userName) ||
    !('format' in value) ||
    !isExportFormat(value.format) ||
    !('fileName' in value) ||
    typeof value.fileName !== 'string' ||
    !SAFE_EXPORT_FILE_NAME_PATTERN.test(value.fileName) ||
    !('exportedAt' in value) ||
    typeof value.exportedAt !== 'string' ||
    Number.isNaN(new Date(value.exportedAt).getTime()) ||
    !('recordsScope' in value) ||
    !isRecordsScope(value.recordsScope) ||
    !('phase' in value) ||
    !isExportPhase(value.phase) ||
    !('totalEntries' in value) ||
    !isNonNegativeInteger(value.totalEntries) ||
    !('totalPhotos' in value) ||
    !isNonNegativeInteger(value.totalPhotos) ||
    !('planChunksCount' in value) ||
    !isNonNegativeInteger(value.planChunksCount) ||
    !('completedPlanChunks' in value) ||
    !isNonNegativeInteger(value.completedPlanChunks) ||
    value.completedPlanChunks > value.planChunksCount ||
    !('processedEntries' in value) ||
    !isNonNegativeInteger(value.processedEntries) ||
    value.processedEntries > value.totalEntries ||
    !('processedPhotos' in value) ||
    !isNonNegativeInteger(value.processedPhotos) ||
    value.processedPhotos > value.totalPhotos ||
    !('photosCount' in value) ||
    !isNonNegativeInteger(value.photosCount) ||
    !('skippedPhotosCount' in value) ||
    !isNonNegativeInteger(value.skippedPhotosCount) ||
    value.photosCount + value.skippedPhotosCount > value.processedPhotos ||
    !('backupChunks' in value) ||
    !Array.isArray(value.backupChunks) ||
    !value.backupChunks.every(
      (chunk) =>
        typeof chunk === 'string' && SAFE_BACKUP_CHUNK_PATH_PATTERN.test(chunk)
    )
  ) {
    return null;
  }

  const planningSelectedEntryIds = parsePlanningSelectedEntryIds(value);

  if (planningSelectedEntryIds === undefined) {
    return null;
  }

  const csvLocalization = parseCsvLocalization(value);

  if (csvLocalization === undefined) {
    return null;
  }

  if (
    value.phase === 'planning' &&
    value.recordsScope.type === 'selected' &&
    planningSelectedEntryIds === null
  ) {
    return null;
  }

  if (
    (value.phase !== 'planning' || value.recordsScope.type !== 'selected') &&
    planningSelectedEntryIds !== null
  ) {
    return null;
  }

  if (value.format === 'csv' && csvLocalization === null) {
    return null;
  }

  if (value.format !== 'csv' && csvLocalization !== null) {
    return null;
  }

  if (
    value.format !== 'fullBackup' &&
    (value.totalPhotos !== 0 ||
      value.processedPhotos !== 0 ||
      value.photosCount !== 0 ||
      value.skippedPhotosCount !== 0)
  ) {
    return null;
  }

  if (value.format === 'csv' && value.backupChunks.length !== 0) {
    return null;
  }

  return {
    version: DIARY_EXPORT_WORK_VERSION,

    exportId: value.exportId,
    userId: value.userId,
    userName: value.userName,

    format: value.format,
    fileName: value.fileName,
    exportedAt: value.exportedAt,

    recordsScope: value.recordsScope,

    phase: value.phase,

    planningSelectedEntryIds,

    csvLocalization,

    totalEntries: value.totalEntries,
    totalPhotos: value.totalPhotos,

    planChunksCount: value.planChunksCount,
    completedPlanChunks: value.completedPlanChunks,

    processedEntries: value.processedEntries,
    processedPhotos: value.processedPhotos,

    photosCount: value.photosCount,
    skippedPhotosCount: value.skippedPhotosCount,

    backupChunks: [...value.backupChunks],
  };
};

const createExportsDirectory = (): Directory => {
  const directory = new Directory(Paths.document, EXPORTS_DIRECTORY_NAME);

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  return directory;
};

const createWorkingDirectory = (): Directory => {
  const directory = new Directory(
    createExportsDirectory(),
    WORKING_DIRECTORY_NAME
  );

  directory.create({
    idempotent: true,
    intermediates: true,
  });

  return directory;
};

const assertValidExportId = (exportId: string): void => {
  if (!SAFE_EXPORT_ID_PATTERN.test(exportId)) {
    throw new Error('Invalid diary export work id');
  }
};

const getWorkDirectory = (exportId: string): Directory => {
  assertValidExportId(exportId);

  return new Directory(createWorkingDirectory(), exportId);
};

const readStateFile = (file: File): DiaryExportWorkState | null => {
  if (!file.exists || file.size <= 0) {
    return null;
  }

  try {
    return parseWorkState(file.textSync());
  } catch {
    return null;
  }
};

const readStateFromDirectory = (
  directory: Directory
): DiaryExportWorkState | null => {
  const currentState = readStateFile(new File(directory, STATE_FILE_NAME));

  if (currentState !== null) {
    return currentState;
  }

  return readStateFile(new File(directory, PREVIOUS_STATE_FILE_NAME));
};

const writeStateFile = (
  directory: Directory,
  state: DiaryExportWorkState
): void => {
  const stateFile = new File(directory, STATE_FILE_NAME);
  const previousStateFile = new File(directory, PREVIOUS_STATE_FILE_NAME);

  if (stateFile.exists && stateFile.size > 0) {
    if (previousStateFile.exists) {
      previousStateFile.delete();
    }

    stateFile.copy(previousStateFile);
  }

  stateFile.create({
    overwrite: true,
    intermediates: false,
  });

  stateFile.write(JSON.stringify(state, null, 2));

  const persistedState = readStateFile(stateFile);

  if (
    persistedState === null ||
    persistedState.exportId !== state.exportId ||
    persistedState.completedPlanChunks !== state.completedPlanChunks ||
    persistedState.processedEntries !== state.processedEntries ||
    persistedState.phase !== state.phase
  ) {
    throw new Error('Diary export work state cannot be persisted');
  }
};

const createPlanChunkFileName = (chunkNumber: number): string =>
  `ids_${chunkNumber.toString().padStart(6, '0')}.json`;

const assertValidPlanChunk = ({
  chunkNumber,
  entryIds,
}: DiaryExportWorkPlanChunk): void => {
  if (
    !Number.isInteger(chunkNumber) ||
    chunkNumber < 1 ||
    entryIds.length === 0 ||
    entryIds.length > DIARY_BACKUP_CHUNK_SIZE ||
    entryIds.some((entryId) => entryId.length === 0) ||
    new Set(entryIds).size !== entryIds.length
  ) {
    throw new Error('Invalid diary export work plan chunk');
  }
};

export const createDiaryExportWorkId = (): string =>
  `export_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const createDiaryExportWork = (
  initialState: DiaryExportWorkState
): void => {
  assertValidExportId(initialState.exportId);

  const directory = getWorkDirectory(initialState.exportId);

  if (directory.exists) {
    throw new Error('Diary export work already exists');
  }

  directory.create({
    idempotent: false,
    intermediates: false,
  });

  new Directory(directory, PLAN_DIRECTORY_NAME).create({
    idempotent: false,
    intermediates: false,
  });

  new Directory(directory, PAYLOAD_DIRECTORY_NAME).create({
    idempotent: false,
    intermediates: false,
  });

  try {
    writeStateFile(directory, initialState);
  } catch (error) {
    directory.delete();

    throw error;
  }
};

export const readDiaryExportWorkState = (
  exportId: string
): DiaryExportWorkState => {
  const directory = getWorkDirectory(exportId);

  if (!directory.exists) {
    throw new Error('Diary export work does not exist');
  }

  const state = readStateFromDirectory(directory);

  if (state === null || state.exportId !== exportId) {
    throw new Error('Diary export work state is invalid');
  }

  return state;
};

export const writeDiaryExportWorkState = (
  state: DiaryExportWorkState
): void => {
  const directory = getWorkDirectory(state.exportId);

  if (!directory.exists) {
    throw new Error('Diary export work does not exist');
  }

  writeStateFile(directory, state);
};

export const listDiaryExportWorkStates = (): DiaryExportWorkState[] => {
  const states = createWorkingDirectory()
    .list()
    .filter(
      (item): item is Directory =>
        item instanceof Directory &&
        item.exists &&
        SAFE_EXPORT_ID_PATTERN.test(item.name)
    )
    .map((directory) => readStateFromDirectory(directory))
    .filter((state): state is DiaryExportWorkState => state !== null);

  states.sort(
    (left, right) =>
      new Date(right.exportedAt).getTime() - new Date(left.exportedAt).getTime()
  );

  return states;
};

export const writeDiaryExportWorkPlanChunk = (
  exportId: string,
  chunk: DiaryExportWorkPlanChunk
): void => {
  assertValidPlanChunk(chunk);

  const directory = getWorkDirectory(exportId);

  if (!directory.exists) {
    throw new Error('Diary export work does not exist');
  }

  const planDirectory = new Directory(directory, PLAN_DIRECTORY_NAME);

  const file = new File(
    planDirectory,
    createPlanChunkFileName(chunk.chunkNumber)
  );

  file.create({
    overwrite: true,
    intermediates: false,
  });

  file.write(JSON.stringify(chunk.entryIds));

  if (!file.exists || file.size <= 0) {
    throw new Error('Diary export work plan chunk cannot be written');
  }
};

export const readDiaryExportWorkPlanChunk = (
  exportId: string,
  chunkNumber: number
): DiaryExportWorkPlanChunk => {
  if (!Number.isInteger(chunkNumber) || chunkNumber < 1) {
    throw new Error('Invalid diary export work plan chunk number');
  }

  const file = new File(
    getWorkDirectory(exportId),
    PLAN_DIRECTORY_NAME,
    createPlanChunkFileName(chunkNumber)
  );

  if (!file.exists || file.size <= 0) {
    throw new Error('Diary export work plan chunk is missing');
  }

  let value: unknown;

  try {
    value = JSON.parse(file.textSync());
  } catch {
    throw new Error('Diary export work plan chunk is invalid');
  }

  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > DIARY_BACKUP_CHUNK_SIZE ||
    value.some(
      (entryId) => typeof entryId !== 'string' || entryId.length === 0
    ) ||
    new Set(value).size !== value.length
  ) {
    throw new Error('Diary export work plan chunk is invalid');
  }

  return {
    chunkNumber,
    entryIds: value,
  };
};

export const getDiaryExportWorkPayloadUri = (exportId: string): string => {
  const directory = new Directory(
    getWorkDirectory(exportId),
    PAYLOAD_DIRECTORY_NAME
  );

  if (!directory.exists) {
    throw new Error('Diary export work payload is missing');
  }

  return directory.uri;
};

export const deleteDiaryExportWork = (exportId: string): void => {
  const directory = getWorkDirectory(exportId);

  if (directory.exists) {
    directory.delete();
  }
};
