import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CalendarProps,
  CalendarProvider,
  WeekCalendar,
} from 'react-native-calendars';

import { SegmentedSwitch } from '@entities/shared/ui';
import { useCalendar } from '@features/shared/model';
import * as styles from '@features/shared/styles/Calendar';
import * as globalStyles from '@features/shared/styles/global';

export type CalendarComponentProps = CalendarProps & {
  showBackToCurrentMonth?: boolean;
  highlightSelected?: boolean;
  showWeekToggle?: boolean;

  blockMinDatePress?: boolean;
  extraDayPaddingBottom?: number;
  weekHeight?: number;
};

const CalendarComponent = ({
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
  const theme = useTheme();

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
    const isSelected = !!markingForDate?.selected;

    const dots = (markedDates?.[dateString]?.dots ??
      markingForDate?.dots ??
      []) as any[];

    const disabledByMin = !!minDate && dateString < minDate;
    const disabledByMarked = !!markingForDate?.disableTouchEvent;

    const disabledForPress =
      disabledByMarked || (blockMinDatePress && disabledByMin);

    const disabledForStyle =
      disabledByMarked || (blockMinDatePress && disabledByMin);

    const handlePress = () => {
      if (disabledForPress) {
        return;
      }
      onPress?.(date);
    };

    return (
      <Pressable onPress={handlePress} style={styles.DayWrapper}>
        <View
          style={styles.DayContainer(theme, {
            isSelected,
            isToday,
            disabled: disabledForStyle,
            highlightSelected,
          })}
        >
          <Text
            style={styles.DayText(theme, {
              isSelected: isSelected && highlightSelected,
              disabled: disabledForStyle,
            })}
          >
            {date.day}
          </Text>
        </View>

        <View style={styles.DayDotsRow}>
          {dots.map((dot: any) => (
            <View key={dot.key} style={styles.DayDot(dot.color)} />
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={globalStyles.GapContainer(10)} onLayout={handleLayout}>
      {showWeekToggle && (
        <SegmentedSwitch
          value={isWeekMode ? 'week' : 'month'}
          onChange={(mode) => handleToggleMode(mode === 'week')}
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
        <View style={styles.WeekWrapperRN}>
          <View style={styles.WeekHeaderRN}>
            <Text style={styles.WeekHeaderTextRN(theme)}>{weekHeader}</Text>
          </View>

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
        </View>
      ) : (
        <>
          <Calendar
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

          {shouldShowButton ? (
            <Pressable
              onPress={handleBackToCurrentMonth}
              style={[
                globalStyles.ButtonStyles(theme),
                {
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                },
              ]}
            >
              <Text style={globalStyles.TextWhite}>
                {t('common.actions.backToCurrentMonth')}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
};

export default CalendarComponent;
