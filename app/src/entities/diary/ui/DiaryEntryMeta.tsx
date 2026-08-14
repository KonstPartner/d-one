import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { dateKit } from '@shared/lib/date';

import type { MealRelation } from '../model/mealRelation';
import { MEAL_RELATION_PRESENTATION } from '../model/mealRelationPresentation';
import * as s from '../styles/DiaryEntryCard';

type DiaryEntryMetaProps = {
  eventAt: Date;
  mealRelation: MealRelation | null;
};

export const DiaryEntryMeta = ({
  eventAt,
  mealRelation,
}: DiaryEntryMetaProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const locale = i18n.resolvedLanguage ?? i18n.language;

  const dateTimeLabel = useMemo(
    () => dateKit.relativeDateTimeLabel(eventAt),
    [eventAt, locale]
  );

  const mealRelationLabel =
    mealRelation === null
      ? null
      : t(`diary.entry.mealRelation.${mealRelation}`);

  const mealRelationPresentation =
    mealRelation === null ? null : MEAL_RELATION_PRESENTATION[mealRelation];

  return (
    <s.Header>
      <s.Time>
        <Ionicons
          name="time-outline"
          size={theme.size.lg}
          color={theme.colors.primary}
        />

        <s.TimeText numberOfLines={1}>{dateTimeLabel}</s.TimeText>
      </s.Time>

      {mealRelationLabel !== null && mealRelationPresentation !== null && (
        <s.MealRelation $tone={mealRelationPresentation.tone}>
          <Ionicons
            name={mealRelationPresentation.icon}
            size={theme.size.base}
            color={theme.colors[mealRelationPresentation.tone]}
          />

          <s.MealRelationText $tone={mealRelationPresentation.tone}>
            {mealRelationLabel}
          </s.MealRelationText>
        </s.MealRelation>
      )}
    </s.Header>
  );
};
