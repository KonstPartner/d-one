import type { Ionicons } from '@expo/vector-icons';

import type { SelectDropdownTone } from '@features/shared/model';

import type { MealRelation } from './types';

type MealRelationPresentation = {
  icon: keyof typeof Ionicons.glyphMap;
  tone: SelectDropdownTone;
};

export const MEAL_RELATION_PRESENTATION: Record<
  MealRelation,
  MealRelationPresentation
> = {
  beforeMeal: {
    icon: 'restaurant-outline',
    tone: 'warning',
  },
  afterMeal: {
    icon: 'checkmark-circle-outline',
    tone: 'success',
  },
  fasting: {
    icon: 'leaf-outline',
    tone: 'success',
  },
  bedtime: {
    icon: 'bed-outline',
    tone: 'primary',
  },
  night: {
    icon: 'moon-outline',
    tone: 'primary',
  },
};
