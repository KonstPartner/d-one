import { useMemo, useRef, useState } from 'react';
import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { DateData } from 'react-native-calendars';

import { i18n } from '@shared/i18n';
import { getCalendarTheme } from '@shared/lib/calendar';
import { dateKit } from '@shared/lib/date';

import type { CalendarComponentProps } from './types';

const getSelectedDateFromMarkedDates = (markedDates: any | undefined) => {
  if (!markedDates) {
    return null;
  }

  for (const key of Object.keys(markedDates)) {
    if (markedDates?.[key]?.selected) {
      return key;
    }
  }

  return null;
};

const formatMonthYear = (dateString: string, locale?: string) => {
  const d = dateKit.local(dateString + 'T00:00:00');

  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
};

const monthKeyFrom = (dateString: string) => dateString.slice(0, 7);

const useCalendar = ({
  showBackToCurrentMonth,
  current,
  onMonthChange,
  markedDates,
  blockMinDatePress,
  minDate,
  onDayPress,
}: CalendarComponentProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const themeKey = useMemo(() => String(theme.mode), [theme.mode]);

  const calendarTheme = useMemo(() => getCalendarTheme(theme), [theme.colors]);

  const currentMonthKey = useMemo(() => {
    const fallback = dateKit.utc().slice(0, 7);

    if (!current) {
      return fallback;
    }

    return monthKeyFrom(String(current));
  }, [current]);

  const [calendarKey, setCalendarKey] = useState(0);
  const [isDifferentMonth, setIsDifferentMonth] = useState(false);

  const lastVisibleMonthKeyRef = useRef<string>(currentMonthKey);

  const handleMonthChange = (month: { year: number; month: number }) => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;

    if (lastVisibleMonthKeyRef.current === monthString) {
      return;
    }

    lastVisibleMonthKeyRef.current = monthString;

    setIsDifferentMonth(monthString !== currentMonthKey);
    onMonthChange?.(month as any);
  };

  const handleBackToCurrentMonth = () => {
    setCalendarKey((k) => k + 1);
    setIsDifferentMonth(false);
  };

  const shouldShowButton = showBackToCurrentMonth && isDifferentMonth;

  const todayString = useMemo(() => dateKit.utc().slice(0, 10), []);

  const selectedDateString = useMemo(
    () => getSelectedDateFromMarkedDates(markedDates),
    [markedDates]
  );

  const baseDate = useMemo(() => {
    return selectedDateString ?? (current as string | undefined) ?? todayString;
  }, [selectedDateString, current, todayString]);

  const [isWeekMode, setIsWeekMode] = useState(false);

  const handleToggleMode = (isWeek?: boolean) => {
    if (isWeek !== undefined && isWeekMode === isWeek) {
      return;
    }

    setIsWeekMode((prev) => !prev);
  };

  const [calendarWidth, setCalendarWidth] = useState(
    Dimensions.get('window').width
  );

  const handleLayout = useCallback((e: any) => {
    const w = e?.nativeEvent?.layout?.width;
    if (w && Number.isFinite(w) && w > 0) {
      setCalendarWidth(w);
    }
  }, []);

  const handleDayPressWrapper = (day: DateData) => {
    if (blockMinDatePress && minDate && day.dateString < minDate) {
      return;
    }

    onDayPress?.(day);
  };

  const [weekHeader, setWeekHeader] = useState(() =>
    formatMonthYear(baseDate, i18n.language)
  );

  return {
    calendarKey,
    handleMonthChange,
    calendarTheme,
    shouldShowButton,
    theme,
    handleBackToCurrentMonth,
    t,
    handleLayout,
    handleToggleMode,
    isWeekMode,
    baseDate,
    weekHeader,
    setWeekHeader,
    formatMonthYear,
    handleDayPressWrapper,
    calendarWidth,
    todayString,
    themeKey,
  };
};

export default useCalendar;
