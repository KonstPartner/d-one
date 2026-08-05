export const MEAL_RELATIONS = [
  'beforeMeal',
  'afterMeal',
  'fasting',
  'bedtime',
  'night',
] as const;

export type MealRelation = (typeof MEAL_RELATIONS)[number];

export const DIARY_SYNC_STATUSES = [
  'synced',
  'pendingCreate',
  'pendingUpdate',
  'pendingDelete',
] as const;

export type DiarySyncStatus = (typeof DIARY_SYNC_STATUSES)[number];

export const DIARY_FILTER_PRESENCE_VALUES = [
  'ignore',
  'has',
  'doesNotHave',
] as const;

export type DiaryFilterPresence = (typeof DIARY_FILTER_PRESENCE_VALUES)[number];

export type DiaryFilterDateBoundary = 'from' | 'to';

export const DIARY_SEARCH_FIELDS = [
  'comment',
  'aiAnalysis',
  'glucose',
  'shortInsulin',
  'longInsulin',
  'carbsGram',
] as const;

export type DiarySearchField = (typeof DIARY_SEARCH_FIELDS)[number];

export type DiarySearch = {
  field: DiarySearchField;
  query: string | number | null;
};

export const isDiaryTextSearchField = (
  field: DiarySearchField
): field is 'comment' | 'aiAnalysis' =>
  field === 'comment' || field === 'aiAnalysis';

export type DiaryFilterDateRange = {
  from: string | null;
  to: string | null;
  activeBoundary: DiaryFilterDateBoundary;
};

export type DiaryFilterNumericRange = {
  min: number | null;
  max: number | null;
};

export type DiaryFilterNumericField =
  | 'glucose'
  | 'shortInsulin'
  | 'longInsulin'
  | 'carbsGram';

export type DiaryFilters = {
  search: DiarySearch;
  date: DiaryFilterDateRange;
  glucose: DiaryFilterNumericRange;
  shortInsulin: DiaryFilterNumericRange;
  longInsulin: DiaryFilterNumericRange;
  carbsGram: DiaryFilterNumericRange;
  mealRelations: MealRelation[];
  photo: DiaryFilterPresence;
  aiAnalysis: DiaryFilterPresence;
};

const createEmptyNumericRange = (): DiaryFilterNumericRange => ({
  min: null,
  max: null,
});

export const createDefaultDiaryFilters = (): DiaryFilters => ({
  search: {
    field: 'comment',
    query: null,
  },
  date: {
    from: null,
    to: null,
    activeBoundary: 'from',
  },
  glucose: createEmptyNumericRange(),
  shortInsulin: createEmptyNumericRange(),
  longInsulin: createEmptyNumericRange(),
  carbsGram: createEmptyNumericRange(),
  mealRelations: [],
  photo: 'ignore',
  aiAnalysis: 'ignore',
});

export const cloneDiaryFilters = (filters: DiaryFilters): DiaryFilters => ({
  search: { ...filters.search },
  date: { ...filters.date },
  glucose: { ...filters.glucose },
  shortInsulin: { ...filters.shortInsulin },
  longInsulin: { ...filters.longInsulin },
  carbsGram: { ...filters.carbsGram },
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

  return { ...date };
};

export const normalizeDiaryFilters = (filters: DiaryFilters): DiaryFilters => {
  const selectedMealRelations = new Set(filters.mealRelations);

  return {
    ...cloneDiaryFilters(filters),
    search: {
      ...filters.search,
      query:
        typeof filters.search.query === 'string'
          ? filters.search.query.trim()
          : filters.search.query,
    },
    date: normalizeDateRange(filters.date),
    mealRelations: MEAL_RELATIONS.filter((mealRelation) =>
      selectedMealRelations.has(mealRelation)
    ),
  };
};

const isValidNumericRange = ({ min, max }: DiaryFilterNumericRange): boolean =>
  (min === null || Number.isFinite(min)) &&
  (max === null || Number.isFinite(max)) &&
  (min === null || max === null || min <= max);

export const areDiaryFilterRangesValid = (filters: DiaryFilters): boolean =>
  isValidNumericRange(filters.glucose) &&
  isValidNumericRange(filters.shortInsulin) &&
  isValidNumericRange(filters.longInsulin) &&
  isValidNumericRange(filters.carbsGram);

const areNumericRangesEqual = (
  first: DiaryFilterNumericRange,
  second: DiaryFilterNumericRange
): boolean => first.min === second.min && first.max === second.max;

export const areDiaryFiltersEqual = (
  first: DiaryFilters,
  second: DiaryFilters
): boolean => {
  const normalizedFirst = normalizeDiaryFilters(first);
  const normalizedSecond = normalizeDiaryFilters(second);

  return (
    normalizedFirst.search.field === normalizedSecond.search.field &&
    normalizedFirst.search.query === normalizedSecond.search.query &&
    areDiaryFilterControlsEqual(normalizedFirst, normalizedSecond)
  );
};

export const areDiaryFilterControlsEqual = (
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

export type DiaryEntry = {
  id: string;
  userId: string;
  glucose: number | null;
  mealRelation: MealRelation | null;
  shortInsulin: number | null;
  longInsulin: number | null;
  carbsGram: number | null;
  comment: string;
  aiAnalysis: string;
  localPhotoUri: string | null;
  photoPath: string | null;
  photoUrl: string | null;
  eventAt: Date;
  syncStatus: DiarySyncStatus;
};

export type CreateDiaryEntryData = Pick<
  DiaryEntry,
  | 'glucose'
  | 'mealRelation'
  | 'shortInsulin'
  | 'longInsulin'
  | 'carbsGram'
  | 'comment'
  | 'eventAt'
>;

export type CreateDiaryEntryInput = CreateDiaryEntryData &
  Pick<DiaryEntry, 'id' | 'localPhotoUri' | 'photoPath'>;

export type UpdateDiaryEntryData = CreateDiaryEntryData &
  Pick<DiaryEntry, 'id'>;

export type DiaryEntryFormMode = 'create' | 'edit';

export type DiaryEntryFormError =
  | 'invalidEventAt'
  | 'invalidGlucose'
  | 'invalidShortInsulin'
  | 'invalidLongInsulin'
  | 'invalidCarbsGram'
  | 'commentTooLong'
  | 'emptyEntry';

export type DiaryPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type DiaryPageResult = {
  items: DiaryEntry[];
  pagination: DiaryPagination;
};
