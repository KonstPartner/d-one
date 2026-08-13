import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Calendar, type CalendarMarkedDates } from '@shared/ui';

import type {
  DiaryFilterDateBoundary,
  DiaryFilterDateRange,
} from '../model/types';
import * as s from '../styles/DiaryFilterSections';

type DiaryFilterDateSectionProps = {
  date: DiaryFilterDateRange;

  calendarCurrent: string;

  markedDates: CalendarMarkedDates;

  onDayPress: (dateString: string) => void;

  onClearDates: () => void;

  onClearBoundary: (boundary: DiaryFilterDateBoundary) => void;

  onActiveBoundaryChange: (boundary: DiaryFilterDateBoundary) => void;
};

export const DiaryFilterDateSection = ({
  date,
  calendarCurrent,
  markedDates,
  onDayPress,
  onClearDates,
  onClearBoundary,
  onActiveBoundaryChange,
}: DiaryFilterDateSectionProps) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const resetDisabled = date.from === null && date.to === null;

  const formatDate = (value: string | null): string => {
    if (value === null) {
      return t('diary.filters.notSet');
    }

    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T12:00:00`));
  };

  const renderBoundary = (
    boundary: DiaryFilterDateBoundary,

    label: string,

    value: string | null
  ) => {
    const active = date.activeBoundary === boundary;

    return (
      <s.DateBoundary $active={active}>
        <s.DateBoundaryMain
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{
            selected: active,
          }}
          onPress={() => onActiveBoundaryChange(boundary)}
        >
          <s.DateBoundaryLabel>{label}</s.DateBoundaryLabel>

          <s.DateBoundaryValue numberOfLines={1}>
            {formatDate(value)}
          </s.DateBoundaryValue>
        </s.DateBoundaryMain>

        {value !== null && (
          <s.ClearBoundaryButton
            accessibilityRole="button"
            accessibilityLabel={t('diary.filters.date.clearBoundary', {
              boundary: label,
            })}
            hitSlop={8}
            onPress={() => onClearBoundary(boundary)}
          >
            <Ionicons
              name="close-circle"
              size={theme.size.md}
              color={theme.colors.muted}
            />
          </s.ClearBoundaryButton>
        )}
      </s.DateBoundary>
    );
  };

  return (
    <s.SectionCard>
      <s.SectionHeader>
        <s.SectionTitle>{t('diary.filters.date.title')}</s.SectionTitle>

        <s.TextAction
          $disabled={resetDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('diary.filters.date.reset')}
          accessibilityState={{
            disabled: resetDisabled,
          }}
          disabled={resetDisabled}
          onPress={onClearDates}
        >
          <s.TextActionLabel $disabled={resetDisabled}>
            {t('diary.filters.reset')}
          </s.TextActionLabel>
        </s.TextAction>
      </s.SectionHeader>

      <s.DateBoundaries>
        {renderBoundary('from', t('diary.filters.date.from'), date.from)}

        {renderBoundary('to', t('diary.filters.date.to'), date.to)}
      </s.DateBoundaries>

      <Calendar
        markingType="period"
        current={calendarCurrent}
        markedDates={markedDates}
        enableSwipeMonths
        onDayPress={(day) => {
          onDayPress(day.dateString);
        }}
      />
    </s.SectionCard>
  );
};
