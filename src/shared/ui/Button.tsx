import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import styled from '@emotion/native';

import { Spinner } from './Spinner';

type ButtonStyle = StyleProp<ViewStyle & TextStyle>;

type ButtonProps = Omit<PressableProps, 'onPress' | 'style'> & {
  onPress: () => void;
  style?: ButtonStyle;
  className?: string;
  onDisableSpinner?: boolean;
};

export const Button = ({
  onPress,
  children,
  style,
  className,
  disabled = false,
  onDisableSpinner = false,
  ...props
}: ButtonProps) => {
  const flattenedStyle = StyleSheet.flatten(style) as
    | (ViewStyle & TextStyle)
    | undefined;

  return (
    <ButtonRoot
      style={style}
      className={className}
      testID="button"
      accessibilityLabel={typeof children === 'string' ? children : ''}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {onDisableSpinner && disabled ? (
        <Spinner
          color={
            typeof flattenedStyle?.color === 'string'
              ? flattenedStyle.color
              : '#ffffff'
          }
          size={
            typeof flattenedStyle?.fontSize === 'number'
              ? flattenedStyle.fontSize
              : 18
          }
        />
      ) : (
        children
      )}
    </ButtonRoot>
  );
};

const ButtonRoot = styled(Pressable)`
  border-radius: 3px;
  padding: 12px 16px;
  color: #ffffff;
  justify-content: center;
  align-items: center;
`;
