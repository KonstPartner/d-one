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
