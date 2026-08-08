import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@emotion/react';
import type { DateData } from 'react-native-calendars';

import { i18n } from '@shared/i18n';
import { getCalendarTheme } from '@shared/lib/calendar';
import { dateKit } from '@shared/lib/date';

import type { CalendarComponentProps, CalendarMarkedDates } from './types';

const getSelectedDateFromMarkedDates = (
  markedDates: CalendarMarkedDates | undefined
): string | null => {
  if (!markedDates) {
    return null;
  }

  for (const [dateString, marking] of Object.entries(markedDates)) {
    if (marking.selected) {
      return dateString;
    }
  }

  return null;
};

const formatMonthYear = (dateString: string, locale?: string): string => {
  const date = dateKit.local(`${dateString}T00:00:00`);

  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  }
};

const getMonthKey = (dateString: string): string => dateString.slice(0, 7);

export const useCalendar = ({
  showBackToCurrentMonth,
  current,
  onMonthChange,
  markedDates,
  blockMinDatePress,
  minDate,
  onDayPress,
}: CalendarComponentProps) => {
  const theme = useTheme();

  const themeKey = String(theme.mode);

  const calendarTheme = useMemo(() => getCalendarTheme(theme), [theme]);

  const currentMonthKey = useMemo(() => {
    const fallback = dateKit.utc().slice(0, 7);

    if (!current) {
      return fallback;
    }

    return getMonthKey(current);
  }, [current]);

  const [calendarKey, setCalendarKey] = useState(0);

  const [isDifferentMonth, setIsDifferentMonth] = useState(false);

  const lastVisibleMonthKeyRef = useRef(currentMonthKey);

  const handleMonthChange = (month: DateData): void => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;

    if (lastVisibleMonthKeyRef.current === monthString) {
      return;
    }

    lastVisibleMonthKeyRef.current = monthString;

    setIsDifferentMonth(monthString !== currentMonthKey);

    onMonthChange?.(month);
  };

  const handleBackToCurrentMonth = (): void => {
    setCalendarKey((currentKey) => currentKey + 1);

    setIsDifferentMonth(false);
  };

  const shouldShowButton = Boolean(showBackToCurrentMonth && isDifferentMonth);

  const todayString = useMemo(() => dateKit.utc().slice(0, 10), []);

  const selectedDateString = useMemo(
    () => getSelectedDateFromMarkedDates(markedDates),
    [markedDates]
  );

  const baseDate = useMemo(
    () => selectedDateString ?? current ?? todayString,
    [selectedDateString, current, todayString]
  );

  const [isWeekMode, setIsWeekMode] = useState(false);

  const handleToggleMode = (nextWeekMode?: boolean): void => {
    if (nextWeekMode === undefined) {
      setIsWeekMode((currentMode) => !currentMode);

      return;
    }

    setIsWeekMode(nextWeekMode);
  };

  const [calendarWidth, setCalendarWidth] = useState(
    Dimensions.get('window').width
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    if (Number.isFinite(width) && width > 0) {
      setCalendarWidth(width);
    }
  }, []);

  const handleDayPressWrapper = (day: DateData): void => {
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
    handleBackToCurrentMonth,
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
