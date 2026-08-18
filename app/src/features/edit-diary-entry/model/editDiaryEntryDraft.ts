import type { DiaryEntry } from '@entities/diary';

export type EditDiaryEntryValues = Pick<
  DiaryEntry,
  | 'glucose'
  | 'mealRelation'
  | 'shortInsulin'
  | 'ultraShortInsulin'
  | 'longInsulin'
  | 'carbsGram'
  | 'comment'
  | 'eventAt'
>;

export const createEditDiaryEntryValues = (
  entry: DiaryEntry
): EditDiaryEntryValues => ({
  glucose: entry.glucose,
  mealRelation: entry.mealRelation,
  shortInsulin: entry.shortInsulin,
  ultraShortInsulin: entry.ultraShortInsulin,
  longInsulin: entry.longInsulin,
  carbsGram: entry.carbsGram,
  comment: entry.comment,
  eventAt: new Date(entry.eventAt),
});
