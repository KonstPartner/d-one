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
