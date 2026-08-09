import type { DiaryLocalRepository } from './DiaryLocalRepository';

const UNSUPPORTED_PLATFORM_MESSAGE =
  'The owner diary database is not available on Web';

export const openDiaryDatabase = (
  _userId: string
): Promise<DiaryLocalRepository> =>
  Promise.reject(new Error(UNSUPPORTED_PLATFORM_MESSAGE));

export const closeDiaryDatabase = (): Promise<void> => Promise.resolve();
