import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastProvider from 'toastify-react-native';

import type { NotificationType } from '@shared/lib/notifications';

import * as s from './styles/Notification';

type CustomToastProps = {
  text1?: string;
  text2?: string;
  hide?: () => void;
  type?: NotificationType;
  data?: {
    durationMs?: number;
  };
};

const TYPE_META: Record<
  NotificationType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: 'success' | 'danger' | 'warning' | 'primary';
  }
> = {
  success: {
    icon: 'checkmark-circle-outline',
    colorKey: 'success',
  },
  error: {
    icon: 'close-circle-outline',
    colorKey: 'danger',
  },
  warn: {
    icon: 'warning-outline',
    colorKey: 'warning',
  },
  info: {
    icon: 'information-circle-outline',
    colorKey: 'primary',
  },
};

const DEFAULT_DURATION = 4000;

const CustomToast = (props: CustomToastProps) => {
  const theme = useTheme();

  const type = props.type ?? 'info';

  const accent = theme.colors[TYPE_META[type].colorKey];
  const iconName = TYPE_META[type].icon;

  const durationMs = props.data?.durationMs ?? DEFAULT_DURATION;

  const [trackWidth, setTrackWidth] = useState(0);

  const translateX = useSharedValue(28);
  const shake = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(durationMs);
  const isClosedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current === null) {
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const safeHide = () => {
    if (isClosedRef.current) {
      return;
    }

    isClosedRef.current = true;

    clearTimer();

    props.hide?.();
  };

  const startTimer = (duration: number) => {
    startedAtRef.current = Date.now();

    clearTimer();

    timerRef.current = setTimeout(safeHide, duration);
  };

  const startProgressAnimation = (duration: number) => {
    if (trackWidth === 0) {
      return;
    }

    cancelAnimation(progressWidth);

    progressWidth.value = withTiming(0, {
      duration,
      easing: Easing.linear,
    });
  };

  const startAll = (duration: number) => {
    if (trackWidth === 0) {
      return;
    }

    startTimer(duration);
    startProgressAnimation(duration);
  };

  const pauseAll = () => {
    clearTimer();

    cancelAnimation(progressWidth);

    const elapsed = Date.now() - startedAtRef.current;

    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  };

  const resumeAll = () => {
    if (trackWidth === 0) {
      return;
    }

    if (remainingRef.current <= 0) {
      safeHide();

      return;
    }

    startAll(remainingRef.current);
  };

  useEffect(() => {
    translateX.value = 28;
    shake.value = 0;

    translateX.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    shake.value = withSequence(
      withTiming(3, { duration: 60 }),
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );

    return () => {
      isClosedRef.current = true;

      clearTimer();

      cancelAnimation(translateX);
      cancelAnimation(shake);
      cancelAnimation(progressWidth);
    };
  }, []);

  useEffect(() => {
    if (trackWidth === 0) {
      return;
    }

    isClosedRef.current = false;
    remainingRef.current = durationMs;

    progressWidth.value = trackWidth;

    startAll(durationMs);
  }, [trackWidth]);

  const wrapperAnimationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value + shake.value,
      },
    ],
  }));

  const progressAnimationStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  return (
    <Animated.View style={[s.AnimatedWrap, wrapperAnimationStyle]}>
      <Pressable
        onPressIn={pauseAll}
        onPressOut={resumeAll}
        style={s.ToastWrapper}
      >
        <View style={s.Container(theme)}>
          <View style={s.Stripe(theme, accent)} />

          <View style={s.Content(theme)}>
            <View style={s.HeaderRow(theme)}>
              <View style={s.TitleRow(theme)}>
                <Ionicons name={iconName} size={theme.size.lg} color={accent} />

                <Text numberOfLines={1} style={s.Title(theme)}>
                  {props.text1}
                </Text>
              </View>

              <Pressable
                onPress={safeHide}
                hitSlop={theme.spacing.md}
                style={s.CloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close notification"
              >
                <Ionicons
                  name="close"
                  size={theme.size.md}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            {!!props.text2 && (
              <Text style={s.Message(theme)}>{props.text2}</Text>
            )}

            <View
              style={s.ProgressTrack(theme)}
              onLayout={(event) => {
                setTrackWidth(event.nativeEvent.layout.width);
              }}
            >
              <Animated.View
                style={[s.ProgressFill(theme, accent), progressAnimationStyle]}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const Notification = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const config = useMemo(
    () => ({
      success: (props: CustomToastProps) => (
        <CustomToast {...props} type="success" />
      ),

      error: (props: CustomToastProps) => (
        <CustomToast {...props} type="error" />
      ),

      warn: (props: CustomToastProps) => <CustomToast {...props} type="warn" />,

      info: (props: CustomToastProps) => <CustomToast {...props} type="info" />,

      default: (props: CustomToastProps) => (
        <CustomToast {...props} type="info" />
      ),
    }),
    []
  );

  return (
    <ToastProvider
      position="top"
      topOffset={Math.max(theme.spacing.sm, insets.top + theme.spacing.sm)}
      width="100%"
      useModal={false}
      config={config}
      style={s.ManagerContainer(theme)}
    />
  );
};
