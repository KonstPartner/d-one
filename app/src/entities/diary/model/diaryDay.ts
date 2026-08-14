import type { DiaryEntry } from './diaryEntry';

export type DiaryDayKey = string;

export type DiaryDayEntry = {
  eventAt: Date;
};

export type DiaryDay<TEntry extends DiaryDayEntry = DiaryEntry> = {
  key: DiaryDayKey;
  entries: TEntry[];
};
