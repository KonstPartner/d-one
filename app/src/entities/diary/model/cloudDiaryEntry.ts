import type { MealRelation } from './mealRelation';

export type CloudDiaryEntry = {
  id: string;
  userId: string;

  glucose: number | null;
  mealRelation: MealRelation | null;
  shortInsulin: number | null;
  longInsulin: number | null;
  carbsGram: number | null;

  comment: string;
  aiAnalysis: string;

  photoPath: string | null;
  photoUrl: string | null;

  eventAt: Date;
};
