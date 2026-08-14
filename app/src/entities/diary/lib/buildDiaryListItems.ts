import { dateKit } from '@shared/lib/date';

import type { DiaryDayEntry, DiaryDayKey } from '../model/diaryDay';

import { groupDiaryEntriesByDay } from './groupDiaryEntriesByDay';

export type DiaryListEntry = DiaryDayEntry & {
  id: string;
};

export type DiaryListItem<TEntry extends DiaryListEntry> =
  | {
      type: 'dayHeader';
      dayKey: DiaryDayKey;
      title: string;
      entriesCount: number;
    }
  | {
      type: 'entry';
      entry: TEntry;
    };

export const buildDiaryListItems = <TEntry extends DiaryListEntry>(
  entries: readonly TEntry[],
  collapsedDayKeys: ReadonlySet<DiaryDayKey>
): DiaryListItem<TEntry>[] => {
  const days = groupDiaryEntriesByDay(entries);

  const items: DiaryListItem<TEntry>[] = [];

  days.forEach((day) => {
    const firstEntry = day.entries[0];

    if (firstEntry === undefined) {
      return;
    }

    items.push({
      type: 'dayHeader',

      dayKey: day.key,

      title: dateKit.format(firstEntry.eventAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),

      entriesCount: day.entries.length,
    });

    if (collapsedDayKeys.has(day.key)) {
      return;
    }

    day.entries.forEach((entry) => {
      items.push({
        type: 'entry',
        entry,
      });
    });
  });

  return items;
};

export const getDiaryListItemKey = <TEntry extends DiaryListEntry>(
  item: DiaryListItem<TEntry>
): string =>
  item.type === 'dayHeader' ? `day:${item.dayKey}` : `entry:${item.entry.id}`;
