import { type ComponentProps, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SpinnerProps = {
  type?: 'Ionicons' | 'MaterialCommunityIcons' | 'Fontisto';
  name?:
    | ComponentProps<typeof Ionicons>['name']
    | ComponentProps<typeof MaterialCommunityIcons>['name']
    | ComponentProps<typeof Fontisto>['name'];
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export const Spinner = ({
  type = 'Fontisto',
  name = 'injection-syringe',
  size = 18,
  color,
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
      {type === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons
          style={style}
          name={name as ComponentProps<typeof MaterialCommunityIcons>['name']}
          size={size}
          color={color ?? theme.colors.text}
        />
      )}
      {type === 'Ionicons' && (
        <Ionicons
          style={style}
          name={name as ComponentProps<typeof Ionicons>['name']}
          size={size}
          color={color ?? theme.colors.text}
        />
      )}
      {type === 'Fontisto' && (
        <Fontisto
          style={style}
          name={name as ComponentProps<typeof Fontisto>['name']}
          size={size}
          color={color ?? theme.colors.text}
        />
      )}
    </Animated.View>
  );
};
