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

export type DiaryEntryQuery = {
  search: DiaryEntrySearch;

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

const createEmptyRange = (): DiaryEntryNumericRange => ({
  min: null,
  max: null,
});

export const createDefaultDiaryEntryQuery = (): DiaryEntryQuery => ({
  search: {
    field: 'comment',
    query: null,
  },

  eventAt: {
    from: null,
    to: null,
  },

  glucose: createEmptyRange(),
  shortInsulin: createEmptyRange(),
  longInsulin: createEmptyRange(),
  carbsGram: createEmptyRange(),

  mealRelations: [],

  photo: 'ignore',
  aiAnalysis: 'ignore',
});
