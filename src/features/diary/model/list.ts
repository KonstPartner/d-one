import { dateKit } from '@features/shared/model';

import type { DiaryEntry } from './types';

export type DiaryDayKey = string;

export type DiaryListItem =
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

type BuildDiaryListItemsOptions = {
  entries: DiaryEntry[];
  collapsedDayKeys: Set<DiaryDayKey>;
};

export const getDiaryDayKey = (eventAt: DiaryEntry['eventAt']): DiaryDayKey => {
  const { year, month, day } = dateKit.formatParts(eventAt);

  return `${year}-${month}-${day}`;
};

export const buildDiaryListItems = ({
  entries,
  collapsedDayKeys,
}: BuildDiaryListItemsOptions): DiaryListItem[] => {
  const groups = new Map<DiaryDayKey, DiaryEntry[]>();

  entries.forEach((entry) => {
    const dayKey = getDiaryDayKey(entry.eventAt);
    const dayEntries = groups.get(dayKey);

    if (dayEntries) {
      dayEntries.push(entry);

      return;
    }

    groups.set(dayKey, [entry]);
  });

  const listItems: DiaryListItem[] = [];

  groups.forEach((dayEntries, dayKey) => {
    const firstEntry = dayEntries[0];

    if (!firstEntry) {
      return;
    }

    listItems.push({
      type: 'dayHeader',
      dayKey,
      title: dateKit.format(firstEntry.eventAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      entriesCount: dayEntries.length,
    });

    if (collapsedDayKeys.has(dayKey)) {
      return;
    }

    dayEntries.forEach((entry) => {
      listItems.push({
        type: 'entry',
        entry,
      });
    });
  });

  return listItems;
};
