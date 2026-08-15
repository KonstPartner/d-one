import { useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import type { DiaryExportScope } from '@features/export-diary';
import {
  buildDiaryFilterMarkedDates,
  type DiaryFilterDateBoundary,
  type DiaryFilterDateRange,
  getDiaryFilterCalendarCurrent,
} from '@features/filter-diary-entries';
import * as ss from '@shared/styles';
import { Button, Calendar, type CalendarMarkedDates } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

type ExportPeriodScreenProps = {
  disabled: boolean;

  onExport: (
    scope: Extract<DiaryExportScope, { type: 'period' }>
  ) => void | Promise<void>;
};

const createInitialDateRange = (): DiaryFilterDateRange => ({
  from: null,
  to: null,
  activeBoundary: 'from',
});

const parseDateKeyToLocalDate = (
  dateKey: string,
  boundary: 'start' | 'end'
): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (boundary === 'start') {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

export const ExportPeriodScreen = ({
  disabled,
  onExport,
}: ExportPeriodScreenProps) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const [date, setDate] = useState<DiaryFilterDateRange>(
    createInitialDateRange
  );

  const markedDates = useMemo<CalendarMarkedDates>(
    () =>
      buildDiaryFilterMarkedDates({
        date,

        primaryColor: theme.colors.primary,
        rangeColor: theme.colors.shades.primary.sm,
        textColor: theme.colors.text,
      }),
    [
      date,
      theme.colors.primary,
      theme.colors.shades.primary.sm,
      theme.colors.text,
    ]
  );

  const calendarCurrent = getDiaryFilterCalendarCurrent(date);

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

  const setBoundary = (boundary: DiaryFilterDateBoundary): void => {
    setDate((current) => ({
      ...current,
      activeBoundary: boundary,
    }));
  };

  const handleDayPress = (dateString: string): void => {
    setDate((current) => {
      if (current.activeBoundary === 'from') {
        return {
          from: dateString,
          to:
            current.to !== null && dateString > current.to ? null : current.to,
          activeBoundary: 'to',
        };
      }

      if (current.from !== null && dateString < current.from) {
        return {
          from: dateString,
          to: null,
          activeBoundary: 'to',
        };
      }

      return {
        ...current,
        to: dateString,
      };
    });
  };

  const canExport =
    !disabled && date.from !== null && date.to !== null && date.from <= date.to;

  const handleExport = (): void => {
    if (!canExport || date.from === null || date.to === null) {
      return;
    }

    void onExport({
      type: 'period',
      from: parseDateKeyToLocalDate(date.from, 'start'),
      to: parseDateKeyToLocalDate(date.to, 'end'),
    });
  };

  const renderBoundary = (
    boundary: DiaryFilterDateBoundary,
    label: string,
    value: string | null
  ) => {
    const active = date.activeBoundary === boundary;

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

          <s.OptionTitle>{formatDate(value)}</s.OptionTitle>
        </s.OptionContent>
      </s.OptionButton>
    );
  };

  return (
    <s.Options>
      <s.Options>
        {renderBoundary('from', t('diary.filters.date.from'), date.from)}

        {renderBoundary('to', t('diary.filters.date.to'), date.to)}
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

      <Button tone="input" disabled={!canExport} onPress={handleExport}>
        <s.OptionTitle style={ss.Text(theme)}>
          {t('transfer.actions.export')}
        </s.OptionTitle>
      </Button>
    </s.Options>
  );
};
