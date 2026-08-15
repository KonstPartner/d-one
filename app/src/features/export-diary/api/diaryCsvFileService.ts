import type { DiaryCsvFileSession } from '../model/diaryCsv';

const createUnsupportedError = (): Error =>
  new Error('Diary CSV export is unavailable on this platform');

export const createDiaryCsvFileSession = (_input: {
  headerRow: string;
}): DiaryCsvFileSession => {
  throw createUnsupportedError();
};
