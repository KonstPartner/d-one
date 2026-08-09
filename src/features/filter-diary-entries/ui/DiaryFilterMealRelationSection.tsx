import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MEAL_RELATIONS, type MealRelation } from '@entities/diary';
import { Checkbox } from '@shared/ui';

import * as s from '../styles/DiaryFilterSections';

type DiaryFilterMealRelationSectionProps = {
  value: readonly MealRelation[];

  onToggle: (mealRelation: MealRelation) => void;
};

export const DiaryFilterMealRelationSection = ({
  value,
  onToggle,
}: DiaryFilterMealRelationSectionProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [opened, setOpened] = useState(false);

  const selectedLabel =
    value.length === 0
      ? t('diary.filters.mealRelation.placeholder')
      : value.length === 1
        ? t(`diary.entry.mealRelation.${value[0]}`)
        : t('diary.filters.mealRelation.selected', {
            count: value.length,
          });

  return (
    <s.SectionCard>
      <s.SectionTitleWithGap>
        {t('diary.filters.mealRelation.title')}
      </s.SectionTitleWithGap>

      <s.DropdownField
        $opened={opened}
        accessibilityRole="button"
        accessibilityLabel={t('diary.filters.mealRelation.accessibilityLabel')}
        accessibilityState={{
          expanded: opened,
        }}
        onPress={() => setOpened((current) => !current)}
      >
        <s.DropdownFieldText numberOfLines={1}>
          {selectedLabel}
        </s.DropdownFieldText>

        <Ionicons
          name={opened ? 'chevron-up' : 'chevron-down'}
          size={theme.size.md}
          color={theme.colors.muted}
        />
      </s.DropdownField>

      {opened && (
        <s.CheckList>
          {MEAL_RELATIONS.map((mealRelation) => {
            const selected = value.includes(mealRelation);

            return (
              <Checkbox
                key={mealRelation}
                checked={selected}
                onPress={() => onToggle(mealRelation)}
              >
                <s.CheckLabel>
                  {t(`diary.entry.mealRelation.${mealRelation}`)}
                </s.CheckLabel>
              </Checkbox>
            );
          })}
        </s.CheckList>
      )}
    </s.SectionCard>
  );
};
