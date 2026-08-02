import { Pressable, Switch, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createDateKit } from '@features/shared/model/utils/date';
import * as globalStyles from '@features/shared/styles/global';

import useDiaryEntryDateTimeFields from '../model/hooks/useDiaryEntryDateTimeFields';
import * as styles from '../styles/DiaryEntryDateTimeFields';

type DiaryEntryDateTimeFieldsProps = {
  eventAt: Date;
  useCurrentDateTime: boolean;
  disabled?: boolean;
  dateAccessibilityLabel: string;
  timeAccessibilityLabel: string;
  currentDateTimeLabel: string;
  onCurrentDateTimeChange: (value: boolean) => void;
  onDateChange: (value: Date) => void;
  onTimeChange: (value: Date) => void;
};

const dateKit = createDateKit();

const DiaryEntryDateTimeFields = ({
  eventAt,
  useCurrentDateTime,
  disabled = false,
  dateAccessibilityLabel,
  timeAccessibilityLabel,
  currentDateTimeLabel,
  onCurrentDateTimeChange,
  onDateChange,
  onTimeChange,
}: DiaryEntryDateTimeFieldsProps) => {
  const theme = useTheme();

  const {
    pickerMode,
    manualSelectionDisabled,
    handleDatePress,
    handleTimePress,
    handleCurrentDateTimePress,
    handlePickerChange,
  } = useDiaryEntryDateTimeFields({
    useCurrentDateTime,
    disabled,
    onCurrentDateTimeChange,
    onDateChange,
    onTimeChange,
  });

  const dateText = dateKit.format(eventAt, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeText = dateKit.format(eventAt, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const controlColor = manualSelectionDisabled
    ? theme.colors.muted
    : theme.colors.text;

  return (
    <View style={globalStyles.Stack(theme, 'sm')}>
      <View style={styles.Controls(theme)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dateAccessibilityLabel}
          accessibilityState={{ disabled: manualSelectionDisabled }}
          disabled={manualSelectionDisabled}
          onPress={handleDatePress}
          style={styles.Control(theme)}
        >
          <Ionicons
            name="calendar-outline"
            size={theme.size.md}
            color={controlColor}
          />

          <Text style={styles.ControlText(theme, manualSelectionDisabled)}>
            {dateText}
          </Text>

          <Ionicons
            name="chevron-down"
            size={theme.size.sm}
            color={controlColor}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={timeAccessibilityLabel}
          accessibilityState={{ disabled: manualSelectionDisabled }}
          disabled={manualSelectionDisabled}
          onPress={handleTimePress}
          style={styles.Control(theme)}
        >
          <Ionicons
            name="time-outline"
            size={theme.size.md}
            color={controlColor}
          />

          <Text style={styles.ControlText(theme, manualSelectionDisabled)}>
            {timeText}
          </Text>

          <Ionicons
            name="chevron-down"
            size={theme.size.sm}
            color={controlColor}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={currentDateTimeLabel}
        accessibilityState={{
          checked: useCurrentDateTime,
          disabled,
        }}
        disabled={disabled}
        onPress={handleCurrentDateTimePress}
        style={styles.CurrentDateTime(theme)}
      >
        <Ionicons
          name="flash-outline"
          size={theme.size.md}
          color={disabled ? theme.colors.muted : theme.colors.primary}
        />

        <Text style={styles.CurrentDateTimeLabel(theme, disabled)}>
          {currentDateTimeLabel}
        </Text>

        <Switch
          accessible={false}
          pointerEvents="none"
          value={useCurrentDateTime}
          disabled={disabled}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.white}
          ios_backgroundColor={theme.colors.border}
        />
      </Pressable>

      {pickerMode !== null ? (
        <DateTimePicker
          value={eventAt}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
};

export default DiaryEntryDateTimeFields;
