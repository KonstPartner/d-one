import type { MealRelation } from './mealRelation';

export const DIARY_SYNC_STATUSES = [
  'synced',
  'pendingCreate',
  'pendingUpdate',
  'pendingDelete',
] as const;

export type DiarySyncStatus = (typeof DIARY_SYNC_STATUSES)[number];

export const isDiarySyncStatus = (value: string): value is DiarySyncStatus =>
  DIARY_SYNC_STATUSES.some((syncStatus) => syncStatus === value);

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
