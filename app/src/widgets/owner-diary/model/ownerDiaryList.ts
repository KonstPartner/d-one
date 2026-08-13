import type { DiaryDayKey, DiaryEntry } from '@entities/diary';
import { groupDiaryEntriesByDay } from '@entities/diary';
import { dateKit } from '@shared/lib/date';

export type OwnerDiaryListItem =
  | {
      type: 'dayHeader';
      dayKey: DiaryDayKey;
      title: string;
      entriesCount: number;
    }
  | {
      type: 'entry';
      entry: DiaryEntry;
    };

export const buildOwnerDiaryListItems = (
  entries: readonly DiaryEntry[],
  collapsedDayKeys: ReadonlySet<DiaryDayKey>
): OwnerDiaryListItem[] => {
  const days = groupDiaryEntriesByDay(entries);

  const items: OwnerDiaryListItem[] = [];

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

export const getOwnerDiaryListItemKey = (item: OwnerDiaryListItem): string =>
  item.type === 'dayHeader' ? `day:${item.dayKey}` : `entry:${item.entry.id}`;
