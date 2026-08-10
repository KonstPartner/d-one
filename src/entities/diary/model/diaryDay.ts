import type { DiaryEntry } from './diaryEntry';

export type DiaryDayKey = string;

export type DiaryDay = {
  key: DiaryDayKey;
  entries: DiaryEntry[];
};
