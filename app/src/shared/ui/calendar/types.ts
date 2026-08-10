import type { StyleProp, ViewStyle } from 'react-native';
import type { CalendarProps } from 'react-native-calendars';

export type CalendarMarkedDates = NonNullable<CalendarProps['markedDates']>;

export type CalendarComponentProps = CalendarProps & {
  showBackToCurrentMonth?: boolean;
  highlightSelected?: boolean;
  showWeekToggle?: boolean;

  blockMinDatePress?: boolean;

  extraDayPaddingBottom?: number;
  weekHeight?: number;
};

export type CalendarListComponentProps = {
  currentDateString: string;

  markedDates: CalendarMarkedDates;

  onDayPress: NonNullable<CalendarProps['onDayPress']>;

  minDate?: string;

  pastScrollRange?: number;
  futureScrollRange?: number;

  showBackToTodayThresholdMonths?: number;

  style?: StyleProp<ViewStyle>;
};
