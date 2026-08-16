import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';

const TOOLBAR_HIDE_DISTANCE = 16;
const TOOLBAR_SHOW_DISTANCE = 6;

const TOOLBAR_HIDE_DURATION = 180;
const TOOLBAR_SHOW_DURATION = 150;

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

type ScrollIntent = 'hide' | 'show';

const getClampedOffsetY = (event: ScrollEvent): number => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

  const maximumOffset = Math.max(
    0,
    contentSize.height - layoutMeasurement.height
  );

  return Math.min(Math.max(contentOffset.y, 0), maximumOffset);
};

export const useCollapsibleToolbarVisibility = () => {
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const toolbarTranslateY = useRef(new Animated.Value(0)).current;

  const toolbarVisibleRef = useRef(true);

  const draggingRef = useRef(false);

  const lastScrollOffsetRef = useRef(0);

  const scrollIntentRef = useRef<ScrollIntent | null>(null);

  const scrollIntentDistanceRef = useRef(0);

  const resetScrollIntent = useCallback((): void => {
    scrollIntentRef.current = null;

    scrollIntentDistanceRef.current = 0;
  }, []);

  const setToolbarVisible = useCallback(
    (visible: boolean): void => {
      if (toolbarVisibleRef.current === visible) {
        return;
      }

      toolbarVisibleRef.current = visible;

      toolbarTranslateY.stopAnimation();

      Animated.timing(toolbarTranslateY, {
        toValue: visible ? 0 : -toolbarHeight,

        duration: visible ? TOOLBAR_SHOW_DURATION : TOOLBAR_HIDE_DURATION,

        useNativeDriver: true,
      }).start();
    },
    [toolbarHeight, toolbarTranslateY]
  );

  const showToolbar = useCallback(() => {
    resetScrollIntent();

    setToolbarVisible(true);
  }, [resetScrollIntent, setToolbarVisible]);

  const handleToolbarLayout = useCallback((event: LayoutChangeEvent): void => {
    const nextHeight = event.nativeEvent.layout.height;

    setToolbarHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight
    );
  }, []);

  useEffect(() => {
    if (toolbarVisibleRef.current || toolbarHeight === 0) {
      return;
    }

    toolbarTranslateY.setValue(-toolbarHeight);
  }, [toolbarHeight, toolbarTranslateY]);

  useEffect(
    () => () => {
      toolbarTranslateY.stopAnimation();
    },
    [toolbarTranslateY]
  );

  const handleScrollBeginDrag = useCallback(
    (event: ScrollEvent): void => {
      draggingRef.current = true;

      lastScrollOffsetRef.current = getClampedOffsetY(event);

      resetScrollIntent();
    },
    [resetScrollIntent]
  );

  const handleScrollEndDrag = useCallback(
    (event: ScrollEvent): void => {
      draggingRef.current = false;

      lastScrollOffsetRef.current = getClampedOffsetY(event);

      resetScrollIntent();
    },
    [resetScrollIntent]
  );

  const handleScroll = useCallback(
    (event: ScrollEvent): void => {
      const { contentSize, layoutMeasurement } = event.nativeEvent;

      const scrollable = contentSize.height > layoutMeasurement.height + 1;

      const offsetY = getClampedOffsetY(event);

      const previousOffsetY = lastScrollOffsetRef.current;

      lastScrollOffsetRef.current = offsetY;

      if (!scrollable) {
        resetScrollIntent();

        setToolbarVisible(true);

        return;
      }

      if (offsetY <= 1) {
        resetScrollIntent();

        setToolbarVisible(true);

        return;
      }

      if (!draggingRef.current) {
        return;
      }

      const delta = offsetY - previousOffsetY;

      if (Math.abs(delta) < 0.5) {
        return;
      }

      const nextIntent: ScrollIntent = delta > 0 ? 'hide' : 'show';

      if (scrollIntentRef.current !== nextIntent) {
        scrollIntentRef.current = nextIntent;

        scrollIntentDistanceRef.current = 0;
      }

      scrollIntentDistanceRef.current += Math.abs(delta);

      if (
        nextIntent === 'hide' &&
        scrollIntentDistanceRef.current >= TOOLBAR_HIDE_DISTANCE
      ) {
        scrollIntentDistanceRef.current = 0;

        setToolbarVisible(false);

        return;
      }

      if (
        nextIntent === 'show' &&
        scrollIntentDistanceRef.current >= TOOLBAR_SHOW_DISTANCE
      ) {
        scrollIntentDistanceRef.current = 0;

        setToolbarVisible(true);
      }
    },
    [resetScrollIntent, setToolbarVisible]
  );

  const toolbarAnimatedStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: toolbarTranslateY,
        },
      ],
    }),
    [toolbarTranslateY]
  );

  const listContentContainerStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: toolbarHeight,
    }),
    [toolbarHeight]
  );

  return {
    toolbarAnimatedStyle,

    listContentContainerStyle,

    handleToolbarLayout,

    handleScroll,

    handleScrollBeginDrag,

    handleScrollEndDrag,

    showToolbar,
  };
};
