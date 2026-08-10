import { useTranslation } from 'react-i18next';
import { CalendarList as RNCalendarList } from 'react-native-calendars';

import * as s from './styles';
import type { CalendarListComponentProps } from './types';
import { useListCalendar } from './useListCalendar';

export const CalendarList = ({
  currentDateString,
  markedDates,
  onDayPress,
  minDate,
  pastScrollRange = 24,
  futureScrollRange = 24,
  showBackToTodayThresholdMonths = 0,
  style,
}: CalendarListComponentProps) => {
  const { t } = useTranslation();

  const {
    listRef,
    handleVisibleMonthsChange,
    calendarTheme,
    shouldShowBackToToday,
    scrollToToday,
  } = useListCalendar({
    showBackToTodayThresholdMonths,
    currentDateString,
  });

  return (
    <s.ListRoot style={style}>
      <RNCalendarList
        ref={listRef}
        current={currentDateString}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={onDayPress}
        onVisibleMonthsChange={handleVisibleMonthsChange}
        minDate={minDate}
        horizontal={false}
        scrollEnabled
        showScrollIndicator={false}
        pastScrollRange={pastScrollRange}
        futureScrollRange={futureScrollRange}
        removeClippedSubviews
        theme={calendarTheme}
      />

      {shouldShowBackToToday && (
        <s.BackToToday pointerEvents="box-none">
          <s.BackButton onPress={scrollToToday}>
            <s.BackButtonText>
              {t('common.actions.backToToday')}
            </s.BackButtonText>
          </s.BackButton>
        </s.BackToToday>
      )}
    </s.ListRoot>
  );
};
