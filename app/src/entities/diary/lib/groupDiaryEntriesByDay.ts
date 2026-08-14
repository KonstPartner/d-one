import type { DiaryDay, DiaryDayEntry, DiaryDayKey } from '../model/diaryDay';

import { getDiaryDayKey } from './getDiaryDayKey';

export const groupDiaryEntriesByDay = <TEntry extends DiaryDayEntry>(
  entries: readonly TEntry[]
): DiaryDay<TEntry>[] => {
  const groups = new Map<DiaryDayKey, DiaryDay<TEntry>>();

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
