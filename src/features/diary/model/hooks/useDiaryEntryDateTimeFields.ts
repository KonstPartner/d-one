import { useCallback, useEffect, useState } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type PickerMode = 'date' | 'time';

type UseDiaryEntryDateTimeFieldsParams = {
  useCurrentDateTime: boolean;
  disabled: boolean;
  onCurrentDateTimeChange: (value: boolean) => void;
  onDateChange: (value: Date) => void;
  onTimeChange: (value: Date) => void;
};

const useDiaryEntryDateTimeFields = ({
  useCurrentDateTime,
  disabled,
  onCurrentDateTimeChange,
  onDateChange,
  onTimeChange,
}: UseDiaryEntryDateTimeFieldsParams) => {
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);

  const manualSelectionDisabled = disabled || useCurrentDateTime;

  useEffect(() => {
    if (manualSelectionDisabled) {
      setPickerMode(null);
    }
  }, [manualSelectionDisabled]);

  const handleDatePress = useCallback(() => {
    if (!manualSelectionDisabled) {
      setPickerMode('date');
    }
  }, [manualSelectionDisabled]);

  const handleTimePress = useCallback(() => {
    if (!manualSelectionDisabled) {
      setPickerMode('time');
    }
  }, [manualSelectionDisabled]);

  const handleCurrentDateTimePress = useCallback(() => {
    if (!disabled) {
      onCurrentDateTimeChange(!useCurrentDateTime);
    }
  }, [disabled, onCurrentDateTimeChange, useCurrentDateTime]);

  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, selectedValue?: Date) => {
      const selectedMode = pickerMode;

      setPickerMode(null);

      if (
        selectedMode === null ||
        event.type !== 'set' ||
        selectedValue === undefined
      ) {
        return;
      }

      if (selectedMode === 'date') {
        onDateChange(selectedValue);

        return;
      }

      onTimeChange(selectedValue);
    },
    [onDateChange, onTimeChange, pickerMode]
  );

  return {
    pickerMode,
    manualSelectionDisabled,
    handleDatePress,
    handleTimePress,
    handleCurrentDateTimePress,
    handlePickerChange,
  };
};

export default useDiaryEntryDateTimeFields;
