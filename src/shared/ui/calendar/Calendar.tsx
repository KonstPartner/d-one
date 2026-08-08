import { useTranslation } from 'react-i18next';
import {
  Calendar as RNCalendar,
  CalendarProvider,
  WeekCalendar,
} from 'react-native-calendars';

import { SegmentedSwitch } from '../SegmentedSwitch';

import * as s from './styles';
import type { CalendarComponentProps } from './types';
import { useCalendar } from './useCalendar';

type CalendarDot = {
  key?: string;
  color: string;
};

export const Calendar = ({
  showBackToCurrentMonth = false,
  showWeekToggle = false,
  current,
  markedDates,
  highlightSelected = false,
  minDate,
  blockMinDatePress = true,
  ...props
}: CalendarComponentProps) => {
  const { t, i18n } = useTranslation();

  const {
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
    todayString,
    themeKey,
    calendarWidth,
  } = useCalendar({
    showBackToCurrentMonth,
    current,
    onMonthChange: props.onMonthChange,
    markedDates,
    blockMinDatePress,
    minDate,
    onDayPress: props.onDayPress,
  });

  const renderDay = (dayProps: any) => {
    const { date, marking, onPress } = dayProps;

    const dateString: string = date.dateString;

    const isToday = dateString === todayString;

    const markingForDate = markedDates?.[dateString] ?? marking;

    const isSelected = Boolean(markingForDate?.selected);

    const dots = (markedDates?.[dateString]?.dots ??
      markingForDate?.dots ??
      []) as CalendarDot[];

    const disabledByMin = Boolean(minDate && dateString < minDate);

    const disabledByMarked = Boolean(markingForDate?.disableTouchEvent);

    const disabled = disabledByMarked || (blockMinDatePress && disabledByMin);

    const handlePress = (): void => {
      if (disabled) {
        return;
      }

      onPress?.(date);
    };

    return (
      <s.Day onPress={handlePress}>
        <s.DayContainer
          $selected={isSelected}
          $today={isToday}
          $disabled={disabled}
          $highlightSelected={highlightSelected}
        >
          <s.DayText
            $selected={isSelected && highlightSelected}
            $disabled={disabled}
          >
            {date.day}
          </s.DayText>
        </s.DayContainer>

        <s.DayDots>
          {dots.map((dot, index) => (
            <s.DayDot
              key={dot.key ?? `${dot.color}-${index}`}
              $color={dot.color}
            />
          ))}
        </s.DayDots>
      </s.Day>
    );
  };

  return (
    <s.Root onLayout={handleLayout}>
      {showWeekToggle && (
        <SegmentedSwitch
          value={isWeekMode ? 'week' : 'month'}
          onChange={(mode) => {
            handleToggleMode(mode === 'week');
          }}
          options={[
            {
              value: 'week',
              label: t('common.actions.showWeek'),
            },
            {
              value: 'month',
              label: t('common.actions.showMonth'),
            },
          ]}
        />
      )}

      {isWeekMode ? (
        <>
          <s.WeekHeader>
            <s.WeekHeaderText>{weekHeader}</s.WeekHeaderText>
          </s.WeekHeader>

          <CalendarProvider
            date={baseDate}
            onDateChanged={(dateString) => {
              setWeekHeader(formatMonthYear(dateString, i18n.language));
            }}
          >
            <WeekCalendar
              key={`${calendarKey}-${themeKey}`}
              current={baseDate}
              firstDay={1}
              markedDates={markedDates}
              onDayPress={handleDayPressWrapper}
              minDate={minDate}
              theme={calendarTheme}
              markingType="multi-dot"
              dayComponent={renderDay}
              calendarWidth={calendarWidth}
            />
          </CalendarProvider>
        </>
      ) : (
        <>
          <RNCalendar
            key={`${calendarKey}-${themeKey}`}
            markingType="multi-dot"
            enableSwipeMonths
            {...props}
            markedDates={markedDates}
            current={current}
            onMonthChange={handleMonthChange}
            onDayPress={handleDayPressWrapper}
            theme={calendarTheme}
            firstDay={1}
            minDate={minDate}
            dayComponent={renderDay}
          />

          {shouldShowButton && (
            <s.BackButton onPress={handleBackToCurrentMonth}>
              <s.BackButtonText>
                {t('common.actions.backToCurrentMonth')}
              </s.BackButtonText>
            </s.BackButton>
          )}
        </>
      )}
    </s.Root>
  );
};
