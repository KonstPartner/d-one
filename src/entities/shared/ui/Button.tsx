import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import * as styles from '@entities/shared/styles/Button';
import Spinner from '@entities/shared/ui/Spinner';

type ButtonProps = TouchableOpacityProps & {
  onPress: () => void;
  className?: string;
  onDisableSpinner?: boolean;
};

const Button = ({
  onPress,
  children,
  style,
  className,
  disabled,
  onDisableSpinner,
  ...props
}: ButtonProps) => {
  const ButtonStyles = [
    styles.TouchableOpacityStyle,
    disabled && styles.TouchableOpacityDisabled,
    style,
  ];
  const ButtonStylesFlatten = StyleSheet.flatten(ButtonStyles) as TextStyle;

  return (
    <Pressable
      style={ButtonStylesFlatten as StyleProp<ViewStyle>}
      className={className}
      testID="button"
      accessibilityLabel={typeof children === 'string' ? children : ''}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {onDisableSpinner && disabled ? (
        <Spinner
          color={(ButtonStylesFlatten?.color as string) || 'black'}
          size={(ButtonStylesFlatten?.fontSize as number) || 18}
        />
      ) : (
        children
      )}
    </Pressable>
  );
};

export default Button;
