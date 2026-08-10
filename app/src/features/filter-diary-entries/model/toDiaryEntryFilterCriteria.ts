import type { DiaryEntryFilterCriteria } from '@entities/diary';

import { areDiaryFilterRangesValid, normalizeDiaryFilters } from './filters';
import type { DiaryFilters } from './types';

const parseLocalDateBoundary = (dateValue: string, endOfDay: boolean): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

  if (match === null) {
    throw new Error(`Invalid diary filter date: ${dateValue}`);
  }

  const [, yearValue, monthValue, dayValue] = match;

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  const date = new Date(0);

  date.setFullYear(year, month - 1, day);

  date.setHours(
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid diary filter date: ${dateValue}`);
  }

  return date;
};

export const toDiaryEntryFilterCriteria = (
  filters: DiaryFilters
): DiaryEntryFilterCriteria => {
  if (!areDiaryFilterRangesValid(filters)) {
    throw new Error('Invalid diary filter range');
  }

  const normalizedFilters = normalizeDiaryFilters(filters);

  return {
    eventAt: {
      from:
        normalizedFilters.date.from === null
          ? null
          : parseLocalDateBoundary(normalizedFilters.date.from, false),

      to:
        normalizedFilters.date.to === null
          ? null
          : parseLocalDateBoundary(normalizedFilters.date.to, true),
    },

    glucose: {
      ...normalizedFilters.glucose,
    },

    shortInsulin: {
      ...normalizedFilters.shortInsulin,
    },

    longInsulin: {
      ...normalizedFilters.longInsulin,
    },

    carbsGram: {
      ...normalizedFilters.carbsGram,
    },

    mealRelations: [...normalizedFilters.mealRelations],

    photo: normalizedFilters.photo,

    aiAnalysis: normalizedFilters.aiAnalysis,
  };
};
