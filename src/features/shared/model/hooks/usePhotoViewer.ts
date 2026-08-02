import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageLoadEventData } from 'expo-image';
import type { LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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

const clampValue = (value: number, minimum: number, maximum: number) => {
  'worklet';

  return Math.min(Math.max(value, minimum), maximum);
};

const usePhotoViewer = ({
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

  const startScale = useSharedValue(MIN_SCALE);
  const startTranslationX = useSharedValue(0);
  const startTranslationY = useSharedValue(0);
  const startFocalX = useSharedValue(0);
  const startFocalY = useSharedValue(0);

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
    setSourceSize(null);

    scale.value = MIN_SCALE;
    translationX.value = 0;
    translationY.value = 0;
  }, [sourceKey, visible, scale, translationX, translationY]);

  useEffect(() => {
    scale.value = MIN_SCALE;
    translationX.value = 0;
    translationY.value = 0;
  }, [
    viewportSize?.height,
    viewportSize?.width,
    scale,
    translationX,
    translationY,
  ]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setViewportSize((currentSize) => {
      if (currentSize?.width === width && currentSize.height === height) {
        return currentSize;
      }

      return { width, height };
    });
  }, []);

  const handleImageLoad = useCallback(
    (event: ImageLoadEventData) => {
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
      startTranslationX.value = translationX.value;
      startTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= MIN_SCALE) {
        return;
      }

      const maximumX = Math.max(
        0,
        (displayedWidth * scale.value - viewportWidth) / 2
      );

      const maximumY = Math.max(
        0,
        (displayedHeight * scale.value - viewportHeight) / 2
      );

      translationX.value = clampValue(
        startTranslationX.value + event.translationX,
        -maximumX,
        maximumX
      );

      translationY.value = clampValue(
        startTranslationY.value + event.translationY,
        -maximumY,
        maximumY
      );
    });

  const pinchGesture = Gesture.Pinch()
    .withTestId('photo-viewer-pinch')
    .enabled(gesturesEnabled)
    .onStart((event) => {
      startScale.value = scale.value;
      startTranslationX.value = translationX.value;
      startTranslationY.value = translationY.value;
      startFocalX.value = event.focalX;
      startFocalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const nextScale = clampValue(
        startScale.value * event.scale,
        MIN_SCALE,
        MAX_SCALE
      );

      const scaleRatio = nextScale / startScale.value;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const nextTranslationX =
        event.focalX -
        centerX -
        scaleRatio * (startFocalX.value - centerX - startTranslationX.value);

      const nextTranslationY =
        event.focalY -
        centerY -
        scaleRatio * (startFocalY.value - centerY - startTranslationY.value);

      const maximumX = Math.max(
        0,
        (displayedWidth * nextScale - viewportWidth) / 2
      );

      const maximumY = Math.max(
        0,
        (displayedHeight * nextScale - viewportHeight) / 2
      );

      scale.value = nextScale;

      translationX.value = clampValue(nextTranslationX, -maximumX, maximumX);

      translationY.value = clampValue(nextTranslationY, -maximumY, maximumY);
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE + 0.01) {
        scale.value = withTiming(MIN_SCALE);
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);

        return;
      }

      const maximumX = Math.max(
        0,
        (displayedWidth * scale.value - viewportWidth) / 2
      );

      const maximumY = Math.max(
        0,
        (displayedHeight * scale.value - viewportHeight) / 2
      );

      translationX.value = withTiming(
        clampValue(translationX.value, -maximumX, maximumX)
      );

      translationY.value = withTiming(
        clampValue(translationY.value, -maximumY, maximumY)
      );
    });

  const doubleTapGesture = Gesture.Tap()
    .withTestId('photo-viewer-double-tap')
    .enabled(gesturesEnabled)
    .numberOfTaps(2)
    .onEnd((event, successful) => {
      if (!successful) {
        return;
      }

      if (scale.value > MIN_SCALE + 0.01) {
        scale.value = withTiming(MIN_SCALE);
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);

        return;
      }

      const maximumX = Math.max(
        0,
        (displayedWidth * DOUBLE_TAP_SCALE - viewportWidth) / 2
      );

      const maximumY = Math.max(
        0,
        (displayedHeight * DOUBLE_TAP_SCALE - viewportHeight) / 2
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

export default usePhotoViewer;
