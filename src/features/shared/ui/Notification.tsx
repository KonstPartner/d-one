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
import ToastProvider, { Toast } from 'toastify-react-native';

import { i18n } from '@features/i18n/model';

import * as globalStyles from '../styles/global';
import * as styles from '../styles/Notifications';

type NotificationType = 'success' | 'error' | 'info' | 'warn';

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  success: 'common.notifications.type.success',
  error: 'common.notifications.type.error',
  info: 'common.notifications.type.info',
  warn: 'common.notifications.type.warn',
};

const TYPE_META: Record<
  NotificationType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: 'success' | 'danger' | 'warning' | 'primary';
  }
> = {
  success: { icon: 'checkmark-circle-outline', colorKey: 'success' },
  error: { icon: 'close-circle-outline', colorKey: 'danger' },
  warn: { icon: 'warning-outline', colorKey: 'warning' },
  info: { icon: 'information-circle-outline', colorKey: 'primary' },
};

const DEFAULT_DURATION = 4000;

export const showNotification = (type: NotificationType, message: string) => {
  Toast.show({
    type,
    position: 'top',
    text1: i18n.t(NOTIFICATION_TYPE_LABELS[type]),
    text2: message,
    autoHide: false,
    visibilityTime: 0,
    data: { durationMs: DEFAULT_DURATION },
  } as any);
};

type CustomToastProps = {
  text1?: string;
  text2?: string;
  hide?: () => void;
  type?: NotificationType;
  data?: { durationMs?: number };
};

const CustomToast = (p: CustomToastProps) => {
  const theme = useTheme();
  const type = (p.type ?? 'info') as NotificationType;

  const accent = theme.colors[TYPE_META[type].colorKey];
  const iconName = TYPE_META[type].icon;

  const durationMs = p.data?.durationMs ?? DEFAULT_DURATION;

  const [trackW, setTrackW] = useState(0);

  const tx = useSharedValue(28);
  const shake = useSharedValue(0);
  const barW = useSharedValue(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(durationMs);
  const isClosedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const safeHide = () => {
    if (isClosedRef.current) {
      return;
    }
    isClosedRef.current = true;
    clearTimer();
    p.hide?.();
  };

  const startTimer = (ms: number) => {
    startedAtRef.current = Date.now();
    clearTimer();
    timerRef.current = setTimeout(safeHide, ms);
  };

  const startProgressAnim = (ms: number) => {
    if (!trackW) {
      return;
    }
    cancelAnimation(barW);
    barW.value = withTiming(0, { duration: ms, easing: Easing.linear });
  };

  const startAll = (ms: number) => {
    if (!trackW) {
      return;
    }
    startTimer(ms);
    startProgressAnim(ms);
  };

  const pauseAll = () => {
    clearTimer();
    cancelAnimation(barW);

    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  };

  const resumeAll = () => {
    if (!trackW) {
      return;
    }
    if (remainingRef.current <= 0) {
      safeHide();

      return;
    }
    startAll(remainingRef.current);
  };

  useEffect(() => {
    tx.value = 28;
    shake.value = 0;

    tx.value = withTiming(0, {
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
      cancelAnimation(tx);
      cancelAnimation(shake);
      cancelAnimation(barW);
    };
  }, []);

  useEffect(() => {
    if (!trackW) {
      return;
    }

    isClosedRef.current = false;
    remainingRef.current = durationMs;

    barW.value = trackW;
    startAll(durationMs);
  }, [trackW]);

  const wrapAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value + shake.value }],
  }));

  const progressAnim = useAnimatedStyle(() => ({
    width: barW.value,
  }));

  return (
    <Animated.View style={[styles.AnimatedWrap, wrapAnim]}>
      <Pressable
        onPressIn={pauseAll}
        onPressOut={resumeAll}
        style={styles.ToastWrapper}
      >
        <View style={styles.Container(theme)}>
          <View style={styles.Stripe(accent)} />

          <View style={styles.Content}>
            <View
              style={globalStyles.ContainerFlex(
                'row',
                'space-between',
                'center',
                10
              )}
            >
              <View
                style={[
                  globalStyles.ContainerFlex('row', '', 'center', 10),
                  styles.TitleRow,
                ]}
              >
                <Ionicons name={iconName} size={22} color={accent} />
                <Text numberOfLines={1} style={styles.Title(theme)}>
                  {p.text1}
                </Text>
              </View>

              <Pressable
                onPress={safeHide}
                hitSlop={12}
                style={styles.CloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close notification"
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            {!!p.text2 && <Text style={styles.Message(theme)}>{p.text2}</Text>}

            <View
              style={styles.ProgressTrack(theme)}
              onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
            >
              <Animated.View
                style={[styles.ProgressFill(accent), progressAnim]}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const Notification = () => {
  const insets = useSafeAreaInsets();

  const config = useMemo(
    () => ({
      success: (p: CustomToastProps) => <CustomToast {...p} type="success" />,
      error: (p: CustomToastProps) => <CustomToast {...p} type="error" />,
      warn: (p: CustomToastProps) => <CustomToast {...p} type="warn" />,
      info: (p: CustomToastProps) => <CustomToast {...p} type="info" />,
      default: (p: CustomToastProps) => <CustomToast {...p} type="info" />,
    }),
    []
  );

  return (
    <ToastProvider
      position="top"
      topOffset={Math.max(8, insets.top + 8)}
      width="100%"
      useModal={false}
      config={config}
      style={styles.ManagerContainer}
    />
  );
};
