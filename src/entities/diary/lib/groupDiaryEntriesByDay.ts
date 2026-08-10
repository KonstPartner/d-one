import type { DiaryDay, DiaryDayKey } from '../model/diaryDay';
import type { DiaryEntry } from '../model/diaryEntry';

import { getDiaryDayKey } from './getDiaryDayKey';

export const groupDiaryEntriesByDay = (
  entries: readonly DiaryEntry[]
): DiaryDay[] => {
  const groups = new Map<DiaryDayKey, DiaryDay>();

  entries.forEach((entry) => {
    const key = getDiaryDayKey(entry.eventAt);

    const existingDay = groups.get(key);

    if (existingDay) {
      existingDay.entries.push(entry);

      return;
    }

    groups.set(key, {
      key,
      entries: [entry],
    });
  });

  return Array.from(groups.values());
};
