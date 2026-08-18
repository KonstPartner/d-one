import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageLoadEventData } from 'expo-image';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PlatformOS } from '@shared/lib/platform';

type Size = {
  width: number;
  height: number;
};

type UsePhotoViewerParams = {
  visible: boolean;
  enabled: boolean;
  sourceKey: string | null;
  onLoad: () => void;
};

const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2.5;
const MAX_SCALE = 4;
const SCALE_EPSILON = 0.01;

const clampValue = (
  value: number,
  minimum: number,
  maximum: number
): number => {
  'worklet';

  return Math.min(Math.max(value, minimum), maximum);
};

const getMaximumTranslation = (
  displayedSize: number,
  viewportSize: number,
  currentScale: number
): number => {
  'worklet';

  return Math.max(0, (displayedSize * currentScale - viewportSize) / 2);
};

const lockOrientation = (
  orientationLock: ScreenOrientation.OrientationLock
): void => {
  void ScreenOrientation.lockAsync(orientationLock).catch((error) => {
    console.error('Failed to change photo viewer orientation', error);
  });
};

export const usePhotoViewer = ({
  visible,
  enabled,
  sourceKey,
  onLoad,
}: UsePhotoViewerParams) => {
  const [viewportSize, setViewportSize] = useState<Size | null>(null);
  const [sourceSize, setSourceSize] = useState<Size | null>(null);

  const scale = useSharedValue(MIN_SCALE);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const pinchStartScale = useSharedValue(MIN_SCALE);
  const pinchStartTranslationX = useSharedValue(0);
  const pinchStartTranslationY = useSharedValue(0);
  const pinchStartFocalX = useSharedValue(0);
  const pinchStartFocalY = useSharedValue(0);
  const pinchActive = useSharedValue(false);

  const imageLayout = useMemo<Size | null>(() => {
    if (viewportSize === null || sourceSize === null) {
      return null;
    }

    const ratio = Math.min(
      viewportSize.width / sourceSize.width,
      viewportSize.height / sourceSize.height
    );

    return {
      width: sourceSize.width * ratio,
      height: sourceSize.height * ratio,
    };
  }, [sourceSize, viewportSize]);

  useEffect(() => {
    if (PlatformOS.WEB) {
      return;
    }

    lockOrientation(
      visible
        ? ScreenOrientation.OrientationLock.DEFAULT
        : ScreenOrientation.OrientationLock.PORTRAIT_UP
    );

    return () => {
      if (visible) {
        lockOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, [visible]);

  useEffect(() => {
    setSourceSize(null);

    cancelAnimation(scale);
    cancelAnimation(translationX);
    cancelAnimation(translationY);

    scale.value = MIN_SCALE;
    translationX.value = 0;
    translationY.value = 0;
    pinchActive.value = false;
  }, [sourceKey, visible, pinchActive, scale, translationX, translationY]);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(translationX);
    cancelAnimation(translationY);

    scale.value = MIN_SCALE;
    translationX.value = 0;
    translationY.value = 0;
    pinchActive.value = false;
  }, [
    viewportSize?.height,
    viewportSize?.width,
    pinchActive,
    scale,
    translationX,
    translationY,
  ]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;

    setViewportSize((currentSize) => {
      if (currentSize?.width === width && currentSize.height === height) {
        return currentSize;
      }

      return {
        width,
        height,
      };
    });
  }, []);

  const handleImageLoad = useCallback(
    (event: ImageLoadEventData): void => {
      setSourceSize({
        width: event.source.width,
        height: event.source.height,
      });

      onLoad();
    },
    [onLoad]
  );

  const displayedWidth = imageLayout?.width ?? 0;
  const displayedHeight = imageLayout?.height ?? 0;

  const viewportWidth = viewportSize?.width ?? 0;
  const viewportHeight = viewportSize?.height ?? 0;

  const gesturesEnabled =
    enabled &&
    displayedWidth > 0 &&
    displayedHeight > 0 &&
    viewportWidth > 0 &&
    viewportHeight > 0;

  const panGesture = Gesture.Pan()
    .withTestId('photo-viewer-pan')
    .enabled(gesturesEnabled)
    .maxPointers(1)
    .onStart(() => {
      cancelAnimation(translationX);
      cancelAnimation(translationY);
    })
    .onChange((event) => {
      if (
        pinchActive.value ||
        event.numberOfPointers !== 1 ||
        scale.value <= MIN_SCALE + SCALE_EPSILON
      ) {
        return;
      }

      const maximumX = getMaximumTranslation(
        displayedWidth,
        viewportWidth,
        scale.value
      );

      const maximumY = getMaximumTranslation(
        displayedHeight,
        viewportHeight,
        scale.value
      );

      translationX.value = clampValue(
        translationX.value + event.changeX,
        -maximumX,
        maximumX
      );

      translationY.value = clampValue(
        translationY.value + event.changeY,
        -maximumY,
        maximumY
      );
    });

  const pinchGesture = Gesture.Pinch()
    .withTestId('photo-viewer-pinch')
    .enabled(gesturesEnabled)
    .onStart((event) => {
      pinchActive.value = true;

      cancelAnimation(scale);
      cancelAnimation(translationX);
      cancelAnimation(translationY);

      pinchStartScale.value = scale.value;
      pinchStartTranslationX.value = translationX.value;
      pinchStartTranslationY.value = translationY.value;
      pinchStartFocalX.value = event.focalX;
      pinchStartFocalY.value = event.focalY;
    })
    .onUpdate((event) => {
      if (event.numberOfPointers !== 2) {
        return;
      }

      const nextScale = clampValue(
        pinchStartScale.value * event.scale,
        MIN_SCALE,
        MAX_SCALE
      );

      const scaleRatio = nextScale / pinchStartScale.value;

      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const nextTranslationX =
        event.focalX -
        centerX -
        scaleRatio *
          (pinchStartFocalX.value - centerX - pinchStartTranslationX.value);

      const nextTranslationY =
        event.focalY -
        centerY -
        scaleRatio *
          (pinchStartFocalY.value - centerY - pinchStartTranslationY.value);

      const maximumX = getMaximumTranslation(
        displayedWidth,
        viewportWidth,
        nextScale
      );

      const maximumY = getMaximumTranslation(
        displayedHeight,
        viewportHeight,
        nextScale
      );

      scale.value = nextScale;

      translationX.value = clampValue(nextTranslationX, -maximumX, maximumX);

      translationY.value = clampValue(nextTranslationY, -maximumY, maximumY);
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE + SCALE_EPSILON) {
        scale.value = withTiming(MIN_SCALE);
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);

        return;
      }

      const maximumX = getMaximumTranslation(
        displayedWidth,
        viewportWidth,
        scale.value
      );

      const maximumY = getMaximumTranslation(
        displayedHeight,
        viewportHeight,
        scale.value
      );

      const nextTranslationX = clampValue(
        translationX.value,
        -maximumX,
        maximumX
      );

      const nextTranslationY = clampValue(
        translationY.value,
        -maximumY,
        maximumY
      );

      if (nextTranslationX !== translationX.value) {
        translationX.value = withTiming(nextTranslationX);
      }

      if (nextTranslationY !== translationY.value) {
        translationY.value = withTiming(nextTranslationY);
      }
    })
    .onFinalize(() => {
      pinchActive.value = false;
    });

  const doubleTapGesture = Gesture.Tap()
    .withTestId('photo-viewer-double-tap')
    .enabled(gesturesEnabled)
    .numberOfTaps(2)
    .onEnd((event, successful) => {
      if (!successful || pinchActive.value) {
        return;
      }

      cancelAnimation(scale);
      cancelAnimation(translationX);
      cancelAnimation(translationY);

      if (scale.value > MIN_SCALE + SCALE_EPSILON) {
        scale.value = withTiming(MIN_SCALE);
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);

        return;
      }

      const maximumX = getMaximumTranslation(
        displayedWidth,
        viewportWidth,
        DOUBLE_TAP_SCALE
      );

      const maximumY = getMaximumTranslation(
        displayedHeight,
        viewportHeight,
        DOUBLE_TAP_SCALE
      );

      const nextTranslationX =
        (viewportWidth / 2 - event.x) * (DOUBLE_TAP_SCALE - 1);

      const nextTranslationY =
        (viewportHeight / 2 - event.y) * (DOUBLE_TAP_SCALE - 1);

      scale.value = withTiming(DOUBLE_TAP_SCALE);

      translationX.value = withTiming(
        clampValue(nextTranslationX, -maximumX, maximumX)
      );

      translationY.value = withTiming(
        clampValue(nextTranslationY, -maximumY, maximumY)
      );
    });

  const gesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    doubleTapGesture
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translationX.value,
      },
      {
        translateY: translationY.value,
      },
      {
        scale: scale.value,
      },
    ],
  }));

  return {
    gesture,
    imageLayout,
    animatedImageStyle,
    handleViewportLayout,
    handleImageLoad,
  };
};
