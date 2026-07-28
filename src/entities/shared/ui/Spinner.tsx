import { useEffect } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SpinnerProps = {
  name?: string;
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
};

const Spinner = ({
  name = 'aperture-outline',
  size = 18,
  color,
  className,
  style,
  ...props
}: SpinnerProps) => {
  const theme = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
  }, [rotation]);

  const animation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animation}>
      <Ionicons
        className={className}
        style={style}
        name={name as any}
        size={size}
        color={color || theme.colors.text}
        {...props}
      />
    </Animated.View>
  );
};

export default Spinner;
