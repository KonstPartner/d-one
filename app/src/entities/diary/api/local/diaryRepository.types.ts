import type { DiaryEntry } from '../../model/diaryEntry';
import type { MealRelation } from '../../model/mealRelation';

export const DIARY_ENTRY_SEARCH_FIELDS = [
  'comment',
  'aiAnalysis',
  'glucose',
  'shortInsulin',
  'longInsulin',
  'carbsGram',
] as const;

export type DiaryEntrySearchField = (typeof DIARY_ENTRY_SEARCH_FIELDS)[number];

export const isDiaryEntrySearchField = (
  value: string
): value is DiaryEntrySearchField =>
  DIARY_ENTRY_SEARCH_FIELDS.some((field) => field === value);

export const isDiaryEntryTextSearchField = (
  field: DiaryEntrySearchField
): field is 'comment' | 'aiAnalysis' =>
  field === 'comment' || field === 'aiAnalysis';

export type DiaryEntrySearch = {
  field: DiaryEntrySearchField;
  query: string | number | null;
};

export type DiaryEntryNumericRange = {
  min: number | null;
  max: number | null;
};

export const createEmptyDiaryEntryNumericRange =
  (): DiaryEntryNumericRange => ({
    min: null,
    max: null,
  });

export const isDiaryEntryNumericRangeValid = ({
  min,
  max,
}: DiaryEntryNumericRange): boolean =>
  (min === null || Number.isFinite(min)) &&
  (max === null || Number.isFinite(max)) &&
  (min === null || max === null || min <= max);

export const DIARY_ENTRY_PRESENCE_VALUES = [
  'ignore',
  'has',
  'doesNotHave',
] as const;

export type DiaryEntryPresence = (typeof DIARY_ENTRY_PRESENCE_VALUES)[number];

export const isDiaryEntryPresence = (
  value: string
): value is DiaryEntryPresence =>
  DIARY_ENTRY_PRESENCE_VALUES.some((presence) => presence === value);

export type DiaryEntryFilterCriteria = {
  eventAt: {
    from: Date | null;
    to: Date | null;
  };

  glucose: DiaryEntryNumericRange;
  shortInsulin: DiaryEntryNumericRange;
  longInsulin: DiaryEntryNumericRange;
  carbsGram: DiaryEntryNumericRange;

  mealRelations: readonly MealRelation[];

  photo: DiaryEntryPresence;
  aiAnalysis: DiaryEntryPresence;
};

export type DiaryEntryQuery = DiaryEntryFilterCriteria & {
  search: DiaryEntrySearch;
};

export type DiaryRepositoryCreateInput = Pick<
  DiaryEntry,
  | 'id'
  | 'glucose'
  | 'mealRelation'
  | 'shortInsulin'
  | 'longInsulin'
  | 'carbsGram'
  | 'comment'
  | 'localPhotoUri'
  | 'photoPath'
  | 'eventAt'
>;

export type DiaryEntryPhotoState = Pick<
  DiaryEntry,
  'localPhotoUri' | 'photoPath' | 'photoUrl'
>;

export type DiaryRepositoryUpdateInput = Pick<
  DiaryEntry,
  | 'id'
  | 'glucose'
  | 'mealRelation'
  | 'shortInsulin'
  | 'longInsulin'
  | 'carbsGram'
  | 'comment'
  | 'eventAt'
> & {
  photo?: DiaryEntryPhotoState;
};

export const createDefaultDiaryEntryFilterCriteria =
  (): DiaryEntryFilterCriteria => ({
    eventAt: {
      from: null,
      to: null,
    },

    glucose: createEmptyDiaryEntryNumericRange(),
    shortInsulin: createEmptyDiaryEntryNumericRange(),
    longInsulin: createEmptyDiaryEntryNumericRange(),
    carbsGram: createEmptyDiaryEntryNumericRange(),

    mealRelations: [],

    photo: 'ignore',
    aiAnalysis: 'ignore',
  });

export const createDefaultDiaryEntryQuery = (): DiaryEntryQuery => ({
  search: {
    field: 'comment',
    query: null,
  },

  ...createDefaultDiaryEntryFilterCriteria(),
});
