import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '@shared/ui';

import { DIARY_ENTRY_METRIC_STEP } from '../model/diaryEntryConstraints';
import { useDiaryMetricStepper } from '../model/useDiaryMetricStepper';
import * as s from '../styles/DiaryMetricStepper';

import DiaryMetricIcon, { type DiaryMetricKey } from './DiaryMetricIcon';

type DiaryMetricStepperProps = {
  metricKey: DiaryMetricKey;

  label: string;

  value: number | null;

  maximum: number;

  disabled?: boolean;

  inputAccessibilityLabel: string;
  decrementAccessibilityLabel: string;
  incrementAccessibilityLabel: string;

  onChange: (value: number | null) => void;
};

export const DiaryMetricStepper = ({
  metricKey,
  label,
  value,
  maximum,
  disabled = false,
  inputAccessibilityLabel,
  decrementAccessibilityLabel,
  incrementAccessibilityLabel,
  onChange,
}: DiaryMetricStepperProps) => {
  const theme = useTheme();

  const metricStep = DIARY_ENTRY_METRIC_STEP[metricKey];

  const {
    inputValue,

    decrementDisabled,
    incrementDisabled,

    handleChangeText,
    handleBlur,

    handleDecrementPressIn,
    handleDecrementPressOut,
    handleDecrementPress,

    handleIncrementPressIn,
    handleIncrementPressOut,
    handleIncrementPress,
  } = useDiaryMetricStepper({
    value,
    maximum,
    step: metricStep.press,
    longPressStep: metricStep.longPress,
    disabled,
    onChange,
  });

  const metricColor = theme.colors.metrics[metricKey].text;

  return (
    <s.Root $metricKey={metricKey}>
      <s.Header>
        <DiaryMetricIcon
          metric={metricKey}
          size={theme.size.xl}
          color={metricColor}
        />

        <s.Label numberOfLines={2}>{label}</s.Label>
      </s.Header>

      <s.Stepper $metricKey={metricKey}>
        <s.StepButton
          $metricKey={metricKey}
          $disabled={decrementDisabled}
          accessibilityRole="button"
          accessibilityLabel={decrementAccessibilityLabel}
          accessibilityState={{
            disabled: decrementDisabled,
          }}
          disabled={decrementDisabled}
          onPressIn={handleDecrementPressIn}
          onPressOut={handleDecrementPressOut}
          onPress={handleDecrementPress}
        >
          <Ionicons
            name="remove"
            size={theme.size.md}
            color={decrementDisabled ? theme.colors.muted : metricColor}
          />
        </s.StepButton>

        <Input
          value={inputValue}
          accessibilityLabel={inputAccessibilityLabel}
          editable={!disabled}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          textAlign="center"
          rejectResponderTermination={false}
          onChangeText={handleChangeText}
          onBlurEvent={handleBlur}
          style={s.getInputStyle(theme, metricKey)}
        />

        <s.StepButton
          $metricKey={metricKey}
          $disabled={incrementDisabled}
          accessibilityRole="button"
          accessibilityLabel={incrementAccessibilityLabel}
          accessibilityState={{
            disabled: incrementDisabled,
          }}
          disabled={incrementDisabled}
          onPressIn={handleIncrementPressIn}
          onPressOut={handleIncrementPressOut}
          onPress={handleIncrementPress}
        >
          <Ionicons
            name="add"
            size={theme.size.md}
            color={incrementDisabled ? theme.colors.muted : metricColor}
          />
        </s.StepButton>
      </s.Stepper>
    </s.Root>
  );
};
