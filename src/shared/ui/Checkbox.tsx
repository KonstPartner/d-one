import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';

import * as s from './styles/Checkbox';

type CheckboxProps = {
  checked: boolean;
  onPress: () => void;

  label?: string;
  children?: ReactNode;
};

export const Checkbox = ({
  checked,
  onPress,
  label = '',
  children,
}: CheckboxProps) => {
  const theme = useTheme();

  return (
    <s.Root
      accessibilityRole="checkbox"
      accessibilityState={{
        checked,
      }}
      onPress={onPress}
    >
      <s.Indicator style={s.getIndicatorStyle(theme, checked)}>
        {checked ? (
          <Ionicons name="checkmark" size={24} color={theme.colors.white} />
        ) : null}
      </s.Indicator>

      {children ?? <s.Label>{label}</s.Label>}
    </s.Root>
  );
};
