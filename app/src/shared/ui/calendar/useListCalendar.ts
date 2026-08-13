import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import type { DateData } from 'react-native-calendars';

import { getCalendarTheme } from '@shared/lib/calendar';

const getMonthKey = (dateString: string): string => dateString.slice(0, 7);

const getMonthsDifference = (fromKey: string, toKey: string): number => {
  const [fromYear, fromMonth] = fromKey.split('-').map(Number);

  const [toYear, toMonth] = toKey.split('-').map(Number);

  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
};

type UseListCalendarParams = {
  currentDateString: string;
  showBackToTodayThresholdMonths: number;
};

export const useListCalendar = ({
  currentDateString,
  showBackToTodayThresholdMonths,
}: UseListCalendarParams) => {
  const theme = useTheme();

  const listRef = useRef<any>(null);

  const currentMonthKey = useMemo(
    () => getMonthKey(currentDateString),
    [currentDateString]
  );

  const calendarTheme = useMemo(() => getCalendarTheme(theme), [theme]);

  const [visibleMonthKey, setVisibleMonthKey] = useState(currentMonthKey);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToMonth?.(currentDateString);
    });

    return () => {
      cancelAnimationFrame(id);
    };
  }, [currentDateString]);

  const handleVisibleMonthsChange = (months: DateData[]) => {
    const first = months[0];

    if (!first?.dateString) {
      return;
    }

    const nextMonthKey = getMonthKey(first.dateString);

    setVisibleMonthKey((current) =>
      current === nextMonthKey ? current : nextMonthKey
    );
  };

  const shouldShowBackToToday = useMemo(() => {
    const difference = Math.abs(
      getMonthsDifference(currentMonthKey, visibleMonthKey)
    );

    return difference > showBackToTodayThresholdMonths;
  }, [currentMonthKey, visibleMonthKey, showBackToTodayThresholdMonths]);

  const scrollToToday = (): void => {
    listRef.current?.scrollToMonth?.(currentDateString);
  };

  return {
    listRef,
    handleVisibleMonthsChange,
    calendarTheme,
    shouldShowBackToToday,
    scrollToToday,
  };
};
