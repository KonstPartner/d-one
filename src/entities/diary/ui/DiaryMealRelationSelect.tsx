import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SelectDropdown, type SelectDropdownOption } from '@shared/ui';

import { MEAL_RELATIONS, type MealRelation } from '../model/mealRelation';

type DiaryMealRelationSelectProps = {
  value: MealRelation | null;

  label: string;
  placeholder: string;
  noneLabel: string;

  disabled?: boolean;

  onChange: (value: MealRelation | null) => void;
};

type MealRelationPresentation = Pick<
  SelectDropdownOption<MealRelation>,
  'icon' | 'tone'
>;

const MEAL_RELATION_PRESENTATION: Record<
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

export const DiaryMealRelationSelect = ({
  value,

  label,
  placeholder,
  noneLabel,

  disabled = false,

  onChange,
}: DiaryMealRelationSelectProps) => {
  const { t } = useTranslation();

  const options = useMemo<SelectDropdownOption<MealRelation | null>[]>(
    () => [
      {
        key: 'none',

        value: null,

        label: noneLabel,

        icon: 'remove-circle-outline',

        tone: 'danger',
      },

      ...MEAL_RELATIONS.map((mealRelation) => ({
        key: mealRelation,

        value: mealRelation,

        label: t(`diary.entry.mealRelation.${mealRelation}`),

        ...MEAL_RELATION_PRESENTATION[mealRelation],
      })),
    ],
    [noneLabel, t]
  );

  const selectedLabel =
    value === null ? noneLabel : t(`diary.entry.mealRelation.${value}`);

  return (
    <SelectDropdown
      label={label}
      placeholder={placeholder}
      selectedLabel={selectedLabel}
      options={options}
      inlineOptions
      disabled={disabled}
      isSelected={(option) => option.value === value}
      onSelect={onChange}
    />
  );
};
