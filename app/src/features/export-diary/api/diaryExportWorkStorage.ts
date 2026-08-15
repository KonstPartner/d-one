import type {
  DiaryExportWorkPlanChunk,
  DiaryExportWorkState,
} from '../model/diaryExportWorkState';

const createUnsupportedError = (): Error =>
  new Error('Diary export work storage is unavailable on this platform');

export const createDiaryExportWorkId = (): string => {
  throw createUnsupportedError();
};

export const createDiaryExportWork = (
  _initialState: DiaryExportWorkState
): void => {
  throw createUnsupportedError();
};

export const readDiaryExportWorkState = (
  _exportId: string
): DiaryExportWorkState => {
  throw createUnsupportedError();
};

export const writeDiaryExportWorkState = (
  _state: DiaryExportWorkState
): void => {
  throw createUnsupportedError();
};

export const listDiaryExportWorkStates = (): DiaryExportWorkState[] => {
  throw createUnsupportedError();
};

export const writeDiaryExportWorkPlanChunk = (
  _exportId: string,
  _chunk: DiaryExportWorkPlanChunk
): void => {
  throw createUnsupportedError();
};

export const readDiaryExportWorkPlanChunk = (
  _exportId: string,
  _chunkNumber: number
): DiaryExportWorkPlanChunk => {
  throw createUnsupportedError();
};

export const getDiaryExportWorkPayloadUri = (_exportId: string): string => {
  throw createUnsupportedError();
};

export const deleteDiaryExportWork = (_exportId: string): void => {
  throw createUnsupportedError();
};
