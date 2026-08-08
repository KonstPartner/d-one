import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { calendarThemeStyles } from '@entities/shared/constants';

const monthKey = (dateString: string) => dateString.slice(0, 7);

const diffMonths = (fromKey: string, toKey: string) => {
  const [fy, fm] = fromKey.split('-').map(Number);
  const [ty, tm] = toKey.split('-').map(Number);

  return (ty - fy) * 12 + (tm - fm);
};

const useListCalendar = ({
  currentDateString,
  showBackToTodayThresholdMonths,
}: {
  currentDateString: string;
  showBackToTodayThresholdMonths: number;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const listRef = useRef<any>(null);

  const currentMonthKey = useMemo(
    () => monthKey(currentDateString),
    [currentDateString]
  );

  const calendarTheme = useMemo(
    () => calendarThemeStyles(theme),
    [theme.colors]
  );

  const [visibleMonthKey, setVisibleMonthKey] = useState(currentMonthKey);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToMonth?.(currentDateString);
    });

    return () => cancelAnimationFrame(id);
  }, [currentDateString]);

  const handleVisibleMonthsChange = (months: Array<{ dateString: string }>) => {
    const first = months?.[0];
    if (!first?.dateString) {
      return;
    }

    const key = monthKey(first.dateString);

    setVisibleMonthKey((prev) => (prev === key ? prev : key));
  };

  const shouldShowBackToToday = useMemo(() => {
    const d = Math.abs(diffMonths(currentMonthKey, visibleMonthKey));

    return d > showBackToTodayThresholdMonths;
  }, [currentMonthKey, visibleMonthKey, showBackToTodayThresholdMonths]);

  const scrollToToday = () => {
    listRef.current?.scrollToMonth?.(currentDateString);
  };

  return {
    listRef,
    handleVisibleMonthsChange,
    calendarTheme,
    shouldShowBackToToday,
    scrollToToday,
    theme,
    t,
  };
};

export default useListCalendar;
