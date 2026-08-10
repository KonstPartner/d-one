import { type ComponentProps, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SpinnerProps = {
  name?: ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
};

export const Spinner = ({
  name = 'aperture',
  size = 18,
  color,
  className,
  style,
}: SpinnerProps) => {
  const theme = useTheme();

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
      }),
      -1,
      false
    );
  }, [rotation]);

  const animation = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <Animated.View style={animation}>
      <Ionicons
        className={className}
        style={style}
        name={name}
        size={size}
        color={color ?? theme.colors.text}
      />
    </Animated.View>
  );
};
