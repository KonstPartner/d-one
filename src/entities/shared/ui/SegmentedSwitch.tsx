import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';

import * as styles from '@entities/shared/styles/SegmentedSwitch';

export type SegmentedSwitchOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SegmentedSwitchProps<T extends string> = {
  value: T;
  options: SegmentedSwitchOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
};

const SegmentedSwitch = <T extends string>({
  value,
  options,
  onChange,
  label,
  disabled = false,
}: SegmentedSwitchProps<T>) => {
  const theme = useTheme();

  return (
    <View style={styles.Wrapper}>
      {label ? <Text style={styles.Label(theme)}>{label}</Text> : null}

      <View style={styles.Container(theme)}>
        {options.map((option) => {
          const active = option.value === value;
          const optionDisabled = disabled || option.disabled;

          return (
            <Pressable
              key={option.value}
              style={styles.Segment(theme, active, optionDisabled)}
              onPress={() => {
                if (!optionDisabled) {
                  onChange(option.value);
                }
              }}
              disabled={optionDisabled}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
                disabled: optionDisabled,
              }}
            >
              <Text style={styles.SegmentText(theme, active, optionDisabled)}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SegmentedSwitch;
