import { Animated } from 'react-native';
import { useTheme } from '@emotion/react';

import {
  clamp,
  NUMERIC_SCALE_END_POSITION,
  NUMERIC_SCALE_START_POSITION,
  type NumericBoundary,
} from '../lib/numericRange';
import type { DiaryFilterNumericRange } from '../model/types';
import { useNumericRangeSlider } from '../model/useNumericRangeSlider';
import * as s from '../styles/NumericRangeSlider';

type NumericRangeSliderProps = {
  range: DiaryFilterNumericRange;

  label: string;

  fromLabel: string;
  toLabel: string;

  nullLabel: string;

  scaleMinimum: number;
  scaleMaximum: number;

  step: number;

  color: string;

  onChange: (boundary: NumericBoundary, value: number | null) => void;
};

export const NumericRangeSlider = ({
  range,
  label,
  fromLabel,
  toLabel,
  nullLabel,
  scaleMinimum,
  scaleMaximum,
  step,
  color,
  onChange,
}: NumericRangeSliderProps) => {
  const theme = useTheme();

  const slider = useNumericRangeSlider({
    range,
    scaleMinimum,
    scaleMaximum,
    step,
    onChange,
  });

  return (
    <>
      <s.Track onLayout={slider.handleTrackLayout}>
        <s.Rail $color={color} />

        <s.NullSlot $boundary="min" $color={color} />

        <s.NullSlot $boundary="max" $color={color} />

        <Animated.View
          style={[
            s.getFillStyle(theme, color),

            {
              left: slider.fillLeft,

              right: slider.fillRight,
            },
          ]}
        />

        <Animated.View
          accessibilityRole="adjustable"
          accessibilityLabel={`${label}: ${fromLabel}`}
          accessibilityValue={
            range.min === null
              ? {
                  text: nullLabel,
                }
              : {
                  min: scaleMinimum,

                  max: scaleMaximum,

                  now: clamp(range.min, scaleMinimum, scaleMaximum),
                }
          }
          accessibilityActions={[
            {
              name: 'increment',
            },
            {
              name: 'decrement',
            },
          ]}
          onAccessibilityAction={(event) =>
            slider.handleAccessibilityAction(
              'min',

              event.nativeEvent.actionName
            )
          }
          style={[
            s.getThumbStyle(theme, color),

            {
              left: slider.minLeft,
            },
          ]}
          {...slider.minPanHandlers}
        />

        <Animated.View
          accessibilityRole="adjustable"
          accessibilityLabel={`${label}: ${toLabel}`}
          accessibilityValue={
            range.max === null
              ? {
                  text: nullLabel,
                }
              : {
                  min: scaleMinimum,

                  max: scaleMaximum,

                  now: clamp(range.max, scaleMinimum, scaleMaximum),
                }
          }
          accessibilityActions={[
            {
              name: 'increment',
            },
            {
              name: 'decrement',
            },
          ]}
          onAccessibilityAction={(event) =>
            slider.handleAccessibilityAction(
              'max',

              event.nativeEvent.actionName
            )
          }
          style={[
            s.getThumbStyle(theme, color),

            {
              left: slider.maxLeft,
            },
          ]}
          {...slider.maxPanHandlers}
        />

        {slider.dragPreview !== null &&
          slider.dragPreview.value !== null &&
          slider.dragPreview.value !== 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                s.getValueBubbleStyle(theme, color),

                {
                  left:
                    slider.dragPreview.boundary === 'min'
                      ? slider.minLeft
                      : slider.maxLeft,
                },
              ]}
            >
              <s.ValueBubbleText>{slider.dragPreview.value}</s.ValueBubbleText>
            </Animated.View>
          )}
      </s.Track>

      <s.Scale>
        <s.ScaleText style={s.getScaleTextPosition(0)}>−∞</s.ScaleText>

        <s.ScaleText
          style={s.getScaleTextPosition(NUMERIC_SCALE_START_POSITION)}
        >
          {scaleMinimum}
        </s.ScaleText>

        <s.ScaleText style={s.getScaleTextPosition(NUMERIC_SCALE_END_POSITION)}>
          {scaleMaximum}
        </s.ScaleText>

        <s.ScaleText style={s.getScaleTextPosition(100)}>∞</s.ScaleText>
      </s.Scale>
    </>
  );
};
