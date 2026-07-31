import type { DiaryRepository } from './diaryRepository';

const UNSUPPORTED_PLATFORM_MESSAGE =
  'The owner diary database is not available on Web';

export const openDiaryDatabase = (_userId: string): Promise<DiaryRepository> =>
  Promise.reject(new Error(UNSUPPORTED_PLATFORM_MESSAGE));

export const closeDiaryDatabase = (): Promise<void> => Promise.resolve();
