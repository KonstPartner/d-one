import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import type { StyleProp, ViewStyle } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import * as sharedStyles from '@shared/styles';

import { Button } from '../Button';

import useListCalendar from './useListCalendar';

type CalendarListComponentProps = {
  currentDateString: string;
  markedDates: Record<string, any>;
  onDayPress: (day: { dateString: string }) => void;
  minDate?: string;
  pastScrollRange?: number;
  futureScrollRange?: number;
  showBackToTodayThresholdMonths?: number;
  style?: StyleProp<ViewStyle>;
};

const rootStyle: ViewStyle = {
  position: 'relative',
  flex: 1,
};

const backToTodayContainerStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 12,
  alignItems: 'center',
};

const CalendarListComponent = ({
  currentDateString,
  markedDates,
  onDayPress,
  minDate,
  pastScrollRange = 24,
  futureScrollRange = 24,
  showBackToTodayThresholdMonths = 0,
  style,
}: CalendarListComponentProps) => {
  const theme = useTheme();
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
    <View style={[rootStyle, style]}>
      <CalendarList
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
        <View style={backToTodayContainerStyle} pointerEvents="box-none">
          <Button
            onPress={scrollToToday}
            style={sharedStyles.Rounded(theme, 'full')}
          >
            <Text
              style={sharedStyles.Text(theme, 'base', 'regular', 'inverse')}
            >
              {t('common.actions.backToToday')}
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
};

export default CalendarListComponent;
