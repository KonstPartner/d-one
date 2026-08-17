import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { Spinner } from './Spinner';
import type { ButtonTone } from './styles/Button';
import * as s from './styles/IconButton';

export type IconButtonProps = Omit<
  PressableProps,
  'children' | 'style' | 'onPress'
> & {
  icon: ComponentProps<typeof Ionicons>['name'];

  onPress: NonNullable<PressableProps['onPress']>;

  style?: StyleProp<ViewStyle>;

  tone?: ButtonTone;

  variant?: s.IconButtonVariant;

  size?: s.IconButtonSize;

  iconSize?: number;

  loading?: boolean;
};

export const IconButton = ({
  icon,
  onPress,
  style,
  tone = 'muted',
  variant = 'solid',
  size = 'md',

  iconSize,

  loading = false,
  disabled = false,

  accessibilityLabel,
  accessibilityState,

  ...props
}: IconButtonProps) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const resolvedIconSize = iconSize ?? s.getIconButtonIconSize(theme, size);

  const foregroundColor = s.getIconButtonForegroundColor(theme, tone, variant);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        ...accessibilityState,

        disabled: isDisabled,

        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        style || s.getIconButtonStyle(theme, tone, variant, size),

        {
          opacity: isDisabled ? 0.45 : pressed ? 0.72 : 1,
        },
      ]}
    >
      {loading ? (
        <Spinner size={resolvedIconSize} color={foregroundColor} />
      ) : (
        <Ionicons
          name={icon}
          size={resolvedIconSize}
          color={foregroundColor}
          style={s.getIconStyle(resolvedIconSize)}
        />
      )}
    </Pressable>
  );
};
