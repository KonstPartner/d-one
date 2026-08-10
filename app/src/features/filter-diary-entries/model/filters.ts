import {
  createEmptyDiaryEntryNumericRange,
  isDiaryEntryNumericRangeValid,
  MEAL_RELATIONS,
} from '@entities/diary';

import type { DiaryFilterDateRange, DiaryFilters } from './types';

export const createDefaultDiaryFilters = (): DiaryFilters => ({
  date: {
    from: null,
    to: null,
    activeBoundary: 'from',
  },

  glucose: createEmptyDiaryEntryNumericRange(),

  shortInsulin: createEmptyDiaryEntryNumericRange(),

  longInsulin: createEmptyDiaryEntryNumericRange(),

  carbsGram: createEmptyDiaryEntryNumericRange(),

  mealRelations: [],

  photo: 'ignore',
  aiAnalysis: 'ignore',
});

export const cloneDiaryFilters = (filters: DiaryFilters): DiaryFilters => ({
  date: {
    ...filters.date,
  },

  glucose: {
    ...filters.glucose,
  },

  shortInsulin: {
    ...filters.shortInsulin,
  },

  longInsulin: {
    ...filters.longInsulin,
  },

  carbsGram: {
    ...filters.carbsGram,
  },

  mealRelations: [...filters.mealRelations],

  photo: filters.photo,
  aiAnalysis: filters.aiAnalysis,
});

const normalizeDateRange = (
  date: DiaryFilterDateRange
): DiaryFilterDateRange => {
  if (date.from !== null && date.to !== null && date.from > date.to) {
    return {
      from: date.to,
      to: date.from,
      activeBoundary: date.activeBoundary,
    };
  }

  return {
    ...date,
  };
};

export const normalizeDiaryFilters = (filters: DiaryFilters): DiaryFilters => {
  const selectedMealRelations = new Set(filters.mealRelations);

  return {
    ...cloneDiaryFilters(filters),

    date: normalizeDateRange(filters.date),

    mealRelations: MEAL_RELATIONS.filter((mealRelation) =>
      selectedMealRelations.has(mealRelation)
    ),
  };
};

export const areDiaryFilterRangesValid = (filters: DiaryFilters): boolean =>
  isDiaryEntryNumericRangeValid(filters.glucose) &&
  isDiaryEntryNumericRangeValid(filters.shortInsulin) &&
  isDiaryEntryNumericRangeValid(filters.longInsulin) &&
  isDiaryEntryNumericRangeValid(filters.carbsGram);

const areNumericRangesEqual = (
  first: DiaryFilters['glucose'],
  second: DiaryFilters['glucose']
): boolean => first.min === second.min && first.max === second.max;

export const areDiaryFiltersEqual = (
  first: DiaryFilters,
  second: DiaryFilters
): boolean => {
  const normalizedFirst = normalizeDiaryFilters(first);

  const normalizedSecond = normalizeDiaryFilters(second);

  return (
    normalizedFirst.date.from === normalizedSecond.date.from &&
    normalizedFirst.date.to === normalizedSecond.date.to &&
    areNumericRangesEqual(normalizedFirst.glucose, normalizedSecond.glucose) &&
    areNumericRangesEqual(
      normalizedFirst.shortInsulin,
      normalizedSecond.shortInsulin
    ) &&
    areNumericRangesEqual(
      normalizedFirst.longInsulin,
      normalizedSecond.longInsulin
    ) &&
    areNumericRangesEqual(
      normalizedFirst.carbsGram,
      normalizedSecond.carbsGram
    ) &&
    normalizedFirst.mealRelations.length ===
      normalizedSecond.mealRelations.length &&
    normalizedFirst.mealRelations.every(
      (mealRelation, index) =>
        mealRelation === normalizedSecond.mealRelations[index]
    ) &&
    normalizedFirst.photo === normalizedSecond.photo &&
    normalizedFirst.aiAnalysis === normalizedSecond.aiAnalysis
  );
};
