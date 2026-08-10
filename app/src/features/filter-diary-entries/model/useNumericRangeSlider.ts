import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, PanResponder } from 'react-native';

import {
  boundaryValueToPosition,
  NUMERIC_SCALE_END_POSITION,
  NUMERIC_SCALE_START_POSITION,
  NUMERIC_SLIDER_COMMIT_ANIMATION_MS,
  NUMERIC_SLIDER_SYNC_ANIMATION_MS,
  type NumericBoundary,
  positionToBoundaryValue,
  snapBoundaryPosition,
} from '../lib/numericRange';

import type { DiaryFilterNumericRange } from './types';

type UseNumericRangeSliderOptions = {
  range: DiaryFilterNumericRange;

  scaleMinimum: number;
  scaleMaximum: number;

  step: number;

  onChange: (boundary: NumericBoundary, value: number | null) => void;
};

export type NumericRangeDragPreview = {
  boundary: NumericBoundary;
  value: number | null;
};

export const useNumericRangeSlider = ({
  range,
  scaleMinimum,
  scaleMaximum,
  step,
  onChange,
}: UseNumericRangeSliderOptions) => {
  const trackWidthRef = useRef(0);

  const rangeRef = useRef(range);

  const draggingBoundaryRef = useRef<NumericBoundary | null>(null);

  const dragStartPositionRef = useRef(0);

  const initialMinPosition = boundaryValueToPosition(
    'min',
    range.min,
    scaleMinimum,
    scaleMaximum
  );

  const initialMaxPosition = boundaryValueToPosition(
    'max',
    range.max,
    scaleMinimum,
    scaleMaximum
  );

  const thumbPositionsRef = useRef({
    min: initialMinPosition,

    max: initialMaxPosition,
  });

  const minPosition = useRef(new Animated.Value(initialMinPosition)).current;

  const maxPosition = useRef(new Animated.Value(initialMaxPosition)).current;

  const [dragPreview, setDragPreview] =
    useState<NumericRangeDragPreview | null>(null);

  const positionAnimations = useMemo(
    () => ({
      min: minPosition,

      max: maxPosition,
    }),
    [maxPosition, minPosition]
  );

  useEffect(() => {
    rangeRef.current = range;

    if (draggingBoundaryRef.current !== null) {
      return;
    }

    const nextPositions = {
      min: boundaryValueToPosition(
        'min',
        range.min,
        scaleMinimum,
        scaleMaximum
      ),

      max: boundaryValueToPosition(
        'max',
        range.max,
        scaleMinimum,
        scaleMaximum
      ),
    };

    thumbPositionsRef.current = nextPositions;

    Animated.parallel([
      Animated.timing(minPosition, {
        toValue: nextPositions.min,

        duration: NUMERIC_SLIDER_SYNC_ANIMATION_MS,

        useNativeDriver: false,
      }),

      Animated.timing(maxPosition, {
        toValue: nextPositions.max,

        duration: NUMERIC_SLIDER_SYNC_ANIMATION_MS,

        useNativeDriver: false,
      }),
    ]).start();
  }, [maxPosition, minPosition, range, scaleMaximum, scaleMinimum]);

  const updateVisualPosition = useCallback(
    (
      boundary: NumericBoundary,

      requestedPosition: number
    ): number => {
      const otherBoundary: NumericBoundary = boundary === 'min' ? 'max' : 'min';

      const position = snapBoundaryPosition(
        boundary,
        requestedPosition,
        thumbPositionsRef.current[otherBoundary]
      );

      thumbPositionsRef.current = {
        ...thumbPositionsRef.current,

        [boundary]: position,
      };

      positionAnimations[boundary].setValue(position);

      return position;
    },
    [positionAnimations]
  );

  const commitPosition = useCallback(
    (boundary: NumericBoundary) => {
      const value = positionToBoundaryValue(
        boundary,

        thumbPositionsRef.current[boundary],

        scaleMinimum,
        scaleMaximum,
        step
      );

      const canonicalPosition = boundaryValueToPosition(
        boundary,
        value,
        scaleMinimum,
        scaleMaximum
      );

      thumbPositionsRef.current = {
        ...thumbPositionsRef.current,

        [boundary]: canonicalPosition,
      };

      Animated.timing(positionAnimations[boundary], {
        toValue: canonicalPosition,

        duration: NUMERIC_SLIDER_COMMIT_ANIMATION_MS,

        useNativeDriver: false,
      }).start();

      if (rangeRef.current[boundary] === value) {
        return;
      }

      rangeRef.current = {
        ...rangeRef.current,

        [boundary]: value,
      };

      onChange(boundary, value);
    },
    [onChange, positionAnimations, scaleMaximum, scaleMinimum, step]
  );

  const createResponder = useCallback(
    (boundary: NumericBoundary) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          draggingBoundaryRef.current = boundary;

          positionAnimations[boundary].stopAnimation((position) => {
            thumbPositionsRef.current = {
              ...thumbPositionsRef.current,

              [boundary]: position,
            };

            dragStartPositionRef.current = position;

            setDragPreview({
              boundary,

              value: positionToBoundaryValue(
                boundary,
                position,
                scaleMinimum,
                scaleMaximum,
                step
              ),
            });
          });
        },

        onPanResponderMove: (_, gestureState) => {
          if (trackWidthRef.current <= 0) {
            return;
          }

          const position = updateVisualPosition(
            boundary,

            dragStartPositionRef.current +
              (gestureState.dx / trackWidthRef.current) * 100
          );

          const value = positionToBoundaryValue(
            boundary,
            position,
            scaleMinimum,
            scaleMaximum,
            step
          );

          setDragPreview((currentPreview) =>
            currentPreview?.boundary === boundary &&
            currentPreview.value === value
              ? currentPreview
              : {
                  boundary,
                  value,
                }
          );
        },

        onPanResponderRelease: () => {
          commitPosition(boundary);

          draggingBoundaryRef.current = null;

          setDragPreview(null);
        },

        onPanResponderTerminate: () => {
          commitPosition(boundary);

          draggingBoundaryRef.current = null;

          setDragPreview(null);
        },

        onPanResponderTerminationRequest: () => false,
      }),
    [
      commitPosition,
      positionAnimations,
      scaleMaximum,
      scaleMinimum,
      step,
      updateVisualPosition,
    ]
  );

  const minResponder = useMemo(() => createResponder('min'), [createResponder]);

  const maxResponder = useMemo(() => createResponder('max'), [createResponder]);

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  const handleAccessibilityAction = useCallback(
    (
      boundary: NumericBoundary,

      actionName: string
    ) => {
      if (actionName !== 'increment' && actionName !== 'decrement') {
        return;
      }

      const currentValue = rangeRef.current[boundary];

      const currentPosition = boundaryValueToPosition(
        boundary,
        currentValue,
        scaleMinimum,
        scaleMaximum
      );

      const numericSteps = (scaleMaximum - scaleMinimum) / step;

      const numericPositionStep =
        (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION) /
        numericSteps;

      let nextPosition =
        currentPosition +
        (actionName === 'decrement'
          ? -numericPositionStep
          : numericPositionStep);

      if (boundary === 'min') {
        if (currentValue === null && actionName === 'increment') {
          nextPosition = NUMERIC_SCALE_START_POSITION;
        } else if (
          currentValue === scaleMinimum &&
          actionName === 'decrement'
        ) {
          nextPosition = 0;
        }
      } else if (currentValue === null && actionName === 'decrement') {
        nextPosition = NUMERIC_SCALE_END_POSITION;
      } else if (currentValue === scaleMaximum && actionName === 'increment') {
        nextPosition = 100;
      }

      updateVisualPosition(boundary, nextPosition);

      commitPosition(boundary);
    },
    [commitPosition, scaleMaximum, scaleMinimum, step, updateVisualPosition]
  );

  const minLeft = minPosition.interpolate({
    inputRange: [0, 100],

    outputRange: ['0%', '100%'],
  });

  const maxLeft = maxPosition.interpolate({
    inputRange: [0, 100],

    outputRange: ['0%', '100%'],
  });

  const fillLeft = minPosition.interpolate({
    inputRange: [NUMERIC_SCALE_START_POSITION, NUMERIC_SCALE_END_POSITION],

    outputRange: [
      `${NUMERIC_SCALE_START_POSITION}%`,
      `${NUMERIC_SCALE_END_POSITION}%`,
    ],

    extrapolate: 'clamp',
  });

  const fillRight = maxPosition.interpolate({
    inputRange: [NUMERIC_SCALE_START_POSITION, NUMERIC_SCALE_END_POSITION],

    outputRange: [
      `${100 - NUMERIC_SCALE_START_POSITION}%`,

      `${100 - NUMERIC_SCALE_END_POSITION}%`,
    ],

    extrapolate: 'clamp',
  });

  return {
    minLeft,
    maxLeft,

    fillLeft,
    fillRight,

    dragPreview,

    minPanHandlers: minResponder.panHandlers,

    maxPanHandlers: maxResponder.panHandlers,

    handleTrackLayout,
    handleAccessibilityAction,
  };
};
