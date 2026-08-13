import { Switch } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import * as s from './styles/ToggleSwitch';

export type ToggleSwitchProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;

  label: string;

  value: boolean;
  disabled?: boolean;

  onValueChange: (value: boolean) => void;
};

export const ToggleSwitch = ({
  icon,
  iconColor,
  label,
  value,
  disabled = false,
  onValueChange,
}: ToggleSwitchProps) => {
  const theme = useTheme();

  return (
    <s.Root $disabled={disabled}>
      <s.Action
        accessible={false}
        disabled={disabled}
        onPress={() => {
          onValueChange(!value);
        }}
      >
        <s.Icon>
          <Ionicons name={icon} size={theme.size.md} color={iconColor} />
        </s.Icon>

        <s.Label>{label}</s.Label>
      </s.Action>

      <s.SwitchArea>
        <Switch
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityState={{
            checked: value,
            disabled,
          }}
          value={value}
          disabled={disabled}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.white}
          ios_backgroundColor={theme.colors.border}
          hitSlop={theme.spacing.sm}
          onValueChange={onValueChange}
        />
      </s.SwitchArea>
    </s.Root>
  );
};
