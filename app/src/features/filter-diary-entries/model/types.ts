import type {
  DiaryEntryNumericRange,
  DiaryEntryPresence,
  MealRelation,
} from '@entities/diary';

export type DiaryFilterDateBoundary = 'from' | 'to';

export type DiaryFilterDateRange = {
  from: string | null;
  to: string | null;
  activeBoundary: DiaryFilterDateBoundary;
};

export const DIARY_FILTER_NUMERIC_FIELDS = [
  'glucose',
  'shortInsulin',
  'ultraShortInsulin',
  'longInsulin',
  'carbsGram',
] as const;

export type DiaryFilterNumericField =
  (typeof DIARY_FILTER_NUMERIC_FIELDS)[number];

export type DiaryFilterNumericRange = DiaryEntryNumericRange;

export type DiaryFilterPresence = DiaryEntryPresence;

export type DiaryFilters = {
  date: DiaryFilterDateRange;

  glucose: DiaryFilterNumericRange;
  shortInsulin: DiaryFilterNumericRange;
  ultraShortInsulin: DiaryFilterNumericRange;
  longInsulin: DiaryFilterNumericRange;
  carbsGram: DiaryFilterNumericRange;

  mealRelations: MealRelation[];

  photo: DiaryFilterPresence;
  aiAnalysis: DiaryFilterPresence;
};
