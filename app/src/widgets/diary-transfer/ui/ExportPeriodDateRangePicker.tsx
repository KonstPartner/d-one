import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import {
  buildDiaryFilterMarkedDates,
  type DiaryFilterDateBoundary,
  type DiaryFilterDateRange,
  getDiaryFilterCalendarCurrent,
} from '@features/filter-diary-entries';
import { Calendar, type CalendarMarkedDates } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

type ExportPeriodDateRangePickerProps = {
  value: DiaryFilterDateRange;

  disabled: boolean;

  onChange: (value: DiaryFilterDateRange) => void;
};

export const ExportPeriodDateRangePicker = ({
  value,

  disabled,

  onChange,
}: ExportPeriodDateRangePickerProps) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const markedDates = useMemo<CalendarMarkedDates>(
    () =>
      buildDiaryFilterMarkedDates({
        date: value,

        primaryColor: theme.colors.primary,

        rangeColor: theme.colors.shades.primary.sm,

        textColor: theme.colors.text,
      }),
    [
      theme.colors.primary,
      theme.colors.shades.primary.sm,
      theme.colors.text,
      value,
    ]
  );

  const calendarCurrent = getDiaryFilterCalendarCurrent(value);

  const formatDate = (dateKey: string | null): string => {
    if (dateKey === null) {
      return t('diary.filters.notSet');
    }

    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${dateKey}T12:00:00`));
  };

  const setBoundary = (boundary: DiaryFilterDateBoundary): void => {
    onChange({
      ...value,

      activeBoundary: boundary,
    });
  };

  const handleDayPress = (dateString: string): void => {
    if (value.activeBoundary === 'from') {
      onChange({
        from: dateString,
        to: null,
        activeBoundary: 'to',
      });

      return;
    }

    if (value.from === null) {
      onChange({
        from: dateString,
        to: null,
        activeBoundary: 'to',
      });

      return;
    }

    if (dateString < value.from) {
      onChange({
        from: dateString,
        to: value.from,
        activeBoundary: 'from',
      });

      return;
    }

    onChange({
      from: value.from,
      to: dateString,
      activeBoundary: 'from',
    });
  };

  const renderBoundary = (
    boundary: DiaryFilterDateBoundary,
    label: string,
    dateKey: string | null
  ) => {
    const active = value.activeBoundary === boundary;

    return (
      <s.OptionButton
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          selected: active,
          disabled,
        }}
        disabled={disabled}
        $disabled={disabled}
        onPress={() => {
          setBoundary(boundary);
        }}
        style={disabled ? undefined : s.getOptionButtonStyle}
      >
        <s.OptionContent>
          <s.OptionDescription>{label}</s.OptionDescription>

          <s.OptionTitle>{formatDate(dateKey)}</s.OptionTitle>
        </s.OptionContent>
      </s.OptionButton>
    );
  };

  return (
    <s.Options>
      <s.Options>
        {renderBoundary('from', t('diary.filters.date.from'), value.from)}

        {renderBoundary('to', t('diary.filters.date.to'), value.to)}
      </s.Options>

      <Calendar
        markingType="period"
        current={calendarCurrent}
        markedDates={markedDates}
        enableSwipeMonths
        onDayPress={(day) => {
          handleDayPress(day.dateString);
        }}
      />
    </s.Options>
  );
};
