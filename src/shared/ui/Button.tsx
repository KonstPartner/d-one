import {
  type PressableProps,
  type RegisteredStyle,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@emotion/react';

import { Spinner } from './Spinner';
import * as s from './styles/Button';

export type ButtonProps = Omit<PressableProps, 'onPress' | 'style'> & {
  onPress: NonNullable<PressableProps['onPress']>;

  style?: PressableProps['style'];

  tone?: s.ButtonTone;
  variant?: s.ButtonVariant;
  size?: s.ButtonSize;

  loading?: boolean;

  className?: string;
};

export type { ButtonSize, ButtonTone, ButtonVariant } from './styles/Button';

export const Button = ({
  onPress,
  children,
  style,

  tone = 'primary',
  variant = 'solid',
  size = 'md',

  loading = false,
  disabled = false,

  className,

  accessibilityLabel,
  accessibilityState,

  testID,

  ...props
}: ButtonProps) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const foregroundColor = s.getButtonForegroundColor(
    theme,
    tone,
    variant,
    isDisabled
  );

  return (
    <s.Root
      {...props}
      className={className}
      testID={testID ?? 'button'}
      disabled={isDisabled}
      accessibilityLabel={
        accessibilityLabel ??
        (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={onPress}
      style={StyleSheet.flatten([
        s.getButtonStyle(theme, tone, variant, size, isDisabled),
        style as RegisteredStyle<ViewStyle>,
      ])}
    >
      {loading ? (
        <Spinner color={foregroundColor} size={s.getSpinnerSize(size)} />
      ) : (
        children
      )}
    </s.Root>
  );
};
