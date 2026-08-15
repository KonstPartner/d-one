import { useTheme } from '@emotion/react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

import { Spinner } from './Spinner';
import * as s from './styles/Button';

export type ButtonProps = Omit<PressableProps, 'onPress' | 'style'> & {
  onPress: NonNullable<PressableProps['onPress']>;

  style?: StyleProp<ViewStyle>;

  tone?: s.ButtonTone;

  spinnerColor?: s.ButtonTone;

  loading?: boolean;
};

export const Button = ({
  onPress,
  children,
  style,

  tone = 'primary',
  spinnerColor,

  loading = false,
  disabled = false,

  accessibilityLabel,
  accessibilityState,

  testID,

  ...props
}: ButtonProps) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const isPrimitiveChild =
    typeof children === 'string' || typeof children === 'number';

  return (
    <s.Root
      {...props}
      $tone={tone}
      testID={testID ?? 'button'}
      disabled={isDisabled}
      accessibilityLabel={
        accessibilityLabel ?? (isPrimitiveChild ? String(children) : undefined)
      }
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={onPress}
      style={[ss.CenterContent, style]}
    >
      {loading ? (
        <Spinner
          color={spinnerColor ? theme.colors[spinnerColor] : theme.colors.white}
          size={32}
        />
      ) : isPrimitiveChild ? (
        <s.Label $tone={tone}>{children}</s.Label>
      ) : (
        children
      )}
    </s.Root>
  );
};
