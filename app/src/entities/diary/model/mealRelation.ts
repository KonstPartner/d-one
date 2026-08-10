export const MEAL_RELATIONS = [
  'beforeMeal',
  'afterMeal',
  'fasting',
  'bedtime',
  'night',
] as const;

export type MealRelation = (typeof MEAL_RELATIONS)[number];

export const isMealRelation = (value: string): value is MealRelation =>
  MEAL_RELATIONS.some((mealRelation) => mealRelation === value);
