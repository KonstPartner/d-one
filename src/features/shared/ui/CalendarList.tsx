import { Pressable, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { useListCalendar } from '../model';
import * as globalStyles from '../styles/global';

type Props = {
  currentDateString: string;
  markedDates: Record<string, any>;
  onDayPress: (day: { dateString: string }) => void;
  minDate?: string;
  pastScrollRange?: number;
  futureScrollRange?: number;
  showBackToTodayThresholdMonths?: number;
  style?: any;
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
}: Props) => {
  const {
    listRef,
    handleVisibleMonthsChange,
    calendarTheme,
    shouldShowBackToToday,
    scrollToToday,
    theme,
    t,
  } = useListCalendar({ showBackToTodayThresholdMonths, currentDateString });

  return (
    <View style={[{ position: 'relative', flex: 1 }, style]}>
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
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 12,
            alignItems: 'center',
          }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={scrollToToday}
            style={[
              globalStyles.ButtonStyles(theme),
              { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
            ]}
          >
            <Text style={globalStyles.TextWhite}>
              {t('common.actions.backToToday')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default CalendarListComponent;
