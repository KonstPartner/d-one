import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import Input from '@entities/shared/ui/Input';

import useMetricStepper from '../model/hooks/useMetricStepper';
import * as styles from '../styles/MetricStepper';

type MetricKey = keyof ReturnType<typeof useTheme>['colors']['metrics'];

type MetricStepperProps = {
  metricKey: MetricKey;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number | null;
  maximum: number;
  disabled?: boolean;
  inputAccessibilityLabel: string;
  decrementAccessibilityLabel: string;
  incrementAccessibilityLabel: string;
  onChange: (value: number | null) => void;
};

const MetricStepper = ({
  metricKey,
  icon,
  label,
  value,
  maximum,
  disabled = false,
  inputAccessibilityLabel,
  decrementAccessibilityLabel,
  incrementAccessibilityLabel,
  onChange,
}: MetricStepperProps) => {
  const theme = useTheme();

  const {
    inputValue,
    decrementDisabled,
    incrementDisabled,
    handleChangeText,
    handleBlur,
    handleDecrementPressIn,
    handleDecrementLongPress,
    handleDecrementPress,
    handleIncrementPressIn,
    handleIncrementLongPress,
    handleIncrementPress,
  } = useMetricStepper({
    value,
    maximum,
    disabled,
    onChange,
  });

  const metricColor = theme.colors.metrics[metricKey].text;

  return (
    <View style={styles.Container(theme, metricKey)}>
      <View style={styles.Header(theme)}>
        <Ionicons name={icon} size={theme.size.xl} color={metricColor} />

        <Text style={styles.Label(theme)} numberOfLines={2}>
          {label}
        </Text>
      </View>

      <View style={styles.Stepper(theme, metricKey)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={decrementAccessibilityLabel}
          accessibilityState={{ disabled: decrementDisabled }}
          disabled={decrementDisabled}
          onPressIn={handleDecrementPressIn}
          onLongPress={handleDecrementLongPress}
          onPress={handleDecrementPress}
          style={styles.StepButton(theme, metricKey, decrementDisabled)}
        >
          <Ionicons
            name="remove"
            size={theme.size.md}
            color={decrementDisabled ? theme.colors.muted : metricColor}
          />
        </Pressable>

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
          style={styles.Input(theme, metricKey)}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={incrementAccessibilityLabel}
          accessibilityState={{ disabled: incrementDisabled }}
          disabled={incrementDisabled}
          onPressIn={handleIncrementPressIn}
          onLongPress={handleIncrementLongPress}
          onPress={handleIncrementPress}
          style={styles.StepButton(theme, metricKey, incrementDisabled)}
        >
          <Ionicons
            name="add"
            size={theme.size.md}
            color={incrementDisabled ? theme.colors.muted : metricColor}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default MetricStepper;
