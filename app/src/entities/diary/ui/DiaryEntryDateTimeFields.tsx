import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { dateKit } from '@shared/lib/date';
import { ToggleSwitch } from '@shared/ui';

import { useDiaryEntryDateTimeFields } from '../model/useDiaryEntryDateTimeFields';
import * as s from '../styles/DiaryEntryDateTimeFields';

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

export const DiaryEntryDateTimeFields = ({
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
    <s.Root>
      <ToggleSwitch
        icon="flash-outline"
        iconColor={disabled ? theme.colors.muted : theme.colors.primary}
        label={currentDateTimeLabel}
        value={useCurrentDateTime}
        disabled={disabled}
        onValueChange={onCurrentDateTimeChange}
      />

      {!useCurrentDateTime && (
        <s.Controls>
          <s.Control
            accessibilityRole="button"
            accessibilityLabel={dateAccessibilityLabel}
            accessibilityState={{
              disabled: manualSelectionDisabled,
            }}
            disabled={manualSelectionDisabled}
            onPress={handleDatePress}
          >
            <Ionicons
              name="calendar-outline"
              size={theme.size.md}
              color={controlColor}
            />

            <s.ControlText $disabled={manualSelectionDisabled}>
              {dateText}
            </s.ControlText>

            <Ionicons
              name="chevron-down"
              size={theme.size.sm}
              color={controlColor}
            />
          </s.Control>

          <s.Control
            accessibilityRole="button"
            accessibilityLabel={timeAccessibilityLabel}
            accessibilityState={{
              disabled: manualSelectionDisabled,
            }}
            disabled={manualSelectionDisabled}
            onPress={handleTimePress}
          >
            <Ionicons
              name="time-outline"
              size={theme.size.md}
              color={controlColor}
            />

            <s.ControlText $disabled={manualSelectionDisabled}>
              {timeText}
            </s.ControlText>

            <Ionicons
              name="chevron-down"
              size={theme.size.sm}
              color={controlColor}
            />
          </s.Control>
        </s.Controls>
      )}

      {pickerMode !== null && (
        <DateTimePicker
          value={eventAt}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </s.Root>
  );
};
