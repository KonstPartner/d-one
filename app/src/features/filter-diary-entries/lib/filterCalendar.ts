import type { CalendarMarkedDates } from '@shared/ui';

import type { DiaryFilterDateRange } from '../model/types';

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateKey = (date: Date): string =>
  [
    date.getUTCFullYear(),

    String(date.getUTCMonth() + 1).padStart(2, '0'),

    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');

const formatLocalDateKey = (date: Date): string =>
  [
    date.getFullYear(),

    String(date.getMonth() + 1).padStart(2, '0'),

    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const addUtcDay = (date: Date): Date => {
  const nextDate = new Date(date);

  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return nextDate;
};

export const getDiaryFilterCalendarCurrent = (
  date: DiaryFilterDateRange,
  now = new Date()
): string => date.from ?? date.to ?? formatLocalDateKey(now);

type BuildDiaryFilterMarkedDatesOptions = {
  date: DiaryFilterDateRange;
  primaryColor: string;
  rangeColor: string;
  textColor: string;
};

export const buildDiaryFilterMarkedDates = ({
  date,
  primaryColor,
  rangeColor,
  textColor,
}: BuildDiaryFilterMarkedDatesOptions): CalendarMarkedDates => {
  if (date.from === null && date.to === null) {
    return {};
  }

  const startKey = date.from ?? date.to;

  const endKey = date.to ?? date.from;

  if (startKey === null || endKey === null) {
    return {};
  }

  const markedDates: CalendarMarkedDates = {};

  const endDate = parseDateKey(endKey);

  for (
    let currentDate = parseDateKey(startKey);
    currentDate.getTime() <= endDate.getTime();
    currentDate = addUtcDay(currentDate)
  ) {
    const dateKey = formatDateKey(currentDate);

    const startingDay = dateKey === startKey;

    const endingDay = dateKey === endKey;

    markedDates[dateKey] = {
      color: startingDay || endingDay ? primaryColor : rangeColor,

      textColor: startingDay || endingDay ? '#ffffff' : textColor,

      startingDay,
      endingDay,
    };
  }

  return markedDates;
};
