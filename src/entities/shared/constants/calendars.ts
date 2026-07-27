import { Theme } from '@emotion/react';

export const calendarThemeStyles = (theme: Theme) => ({
  backgroundColor: theme.colors.bg,
  calendarBackground: theme.colors.bg,
  dayTextColor: theme.colors.text,
  monthTextColor: theme.colors.text,
  textDisabledColor: theme.colors.muted,
  selectedDayBackgroundColor: theme.colors.primary,
  selectedDayTextColor: '#fff',
  todayTextColor: theme.colors.text,
  arrowColor: theme.colors.text,
  textSectionTitleColor: theme.colors.muted,
});
