import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import Input from '@entities/shared/ui/Input';
import * as globalStyles from '@features/shared/styles/global';

import useMetricStepper from '../model/hooks/useMetricStepper';

type MetricStepperProps = {
  label: string;
  value: number | null;
  disabled?: boolean;
  inputAccessibilityLabel: string;
  decrementAccessibilityLabel: string;
  incrementAccessibilityLabel: string;
  clearAccessibilityLabel: string;
  onChange: (value: number | null) => void;
};

const MetricStepper = ({
  label,
  value,
  disabled = false,
  inputAccessibilityLabel,
  decrementAccessibilityLabel,
  incrementAccessibilityLabel,
  clearAccessibilityLabel,
  onChange,
}: MetricStepperProps) => {
  const theme = useTheme();

  const {
    inputValue,
    decrementDisabled,
    clearDisabled,
    handleChangeText,
    handleBlur,
    handleClear,
    handleDecrementPressIn,
    handleDecrementLongPress,
    handleDecrementPress,
    handleIncrementPressIn,
    handleIncrementLongPress,
    handleIncrementPress,
  } = useMetricStepper({
    value,
    disabled,
    onChange,
  });

  return (
    <View style={globalStyles.Stack(theme, 'xs')}>
      <Text style={globalStyles.Label(theme)}>{label}</Text>

      <View style={globalStyles.Row(theme, 'center', 'flex-start', 'sm')}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={decrementAccessibilityLabel}
          accessibilityState={{ disabled: decrementDisabled }}
          disabled={decrementDisabled}
          onPressIn={handleDecrementPressIn}
          onLongPress={handleDecrementLongPress}
          onPress={handleDecrementPress}
          style={globalStyles.IconButton(
            theme,
            'secondary',
            'md',
            decrementDisabled
          )}
        >
          <Ionicons
            name="remove"
            size={theme.size.md}
            color={decrementDisabled ? theme.colors.muted : theme.colors.text}
          />
        </Pressable>

        <View style={globalStyles.FlexItem}>
          <Input
            value={inputValue}
            accessibilityLabel={inputAccessibilityLabel}
            editable={!disabled}
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            textAlign="center"
            onChangeText={handleChangeText}
            onBlurEvent={handleBlur}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={incrementAccessibilityLabel}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPressIn={handleIncrementPressIn}
          onLongPress={handleIncrementLongPress}
          onPress={handleIncrementPress}
          style={globalStyles.IconButton(theme, 'secondary', 'md', disabled)}
        >
          <Ionicons
            name="add"
            size={theme.size.md}
            color={disabled ? theme.colors.muted : theme.colors.text}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={clearAccessibilityLabel}
          accessibilityState={{ disabled: clearDisabled }}
          disabled={clearDisabled}
          onPress={handleClear}
          style={globalStyles.IconButton(theme, 'ghost', 'md', clearDisabled)}
        >
          <Ionicons
            name="close"
            size={theme.size.md}
            color={clearDisabled ? theme.colors.muted : theme.colors.danger}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default MetricStepper;
