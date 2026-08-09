export type NumericBoundary = 'min' | 'max';

export const NUMERIC_SCALE_START_POSITION = 14;

export const NUMERIC_SCALE_END_POSITION = 86;

export const NUMERIC_SLIDER_SYNC_ANIMATION_MS = 140;

export const NUMERIC_SLIDER_COMMIT_ANIMATION_MS = 90;

const LEFT_NULL_SNAP_POSITION = NUMERIC_SCALE_START_POSITION / 2;

const RIGHT_NULL_SNAP_POSITION = (NUMERIC_SCALE_END_POSITION + 100) / 2;

export const clamp = (
  value: number,
  minimum: number,
  maximum: number
): number => Math.min(Math.max(value, minimum), maximum);

export const roundToStep = (value: number, step: number): number => {
  const decimalPlaces = step < 1 ? 1 : 0;

  return Number((Math.round(value / step) * step).toFixed(decimalPlaces));
};

export const numericValueToPosition = (
  value: number,
  scaleMinimum: number,
  scaleMaximum: number
): number =>
  NUMERIC_SCALE_START_POSITION +
  ((clamp(value, scaleMinimum, scaleMaximum) - scaleMinimum) /
    (scaleMaximum - scaleMinimum)) *
    (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION);

export const boundaryValueToPosition = (
  boundary: NumericBoundary,
  value: number | null,
  scaleMinimum: number,
  scaleMaximum: number
): number => {
  if (value === null) {
    return boundary === 'min' ? 0 : 100;
  }

  return numericValueToPosition(value, scaleMinimum, scaleMaximum);
};

export const positionToBoundaryValue = (
  boundary: NumericBoundary,
  position: number,
  scaleMinimum: number,
  scaleMaximum: number,
  step: number
): number | null => {
  if (boundary === 'min' && position < NUMERIC_SCALE_START_POSITION) {
    return null;
  }

  if (boundary === 'max' && position > NUMERIC_SCALE_END_POSITION) {
    return null;
  }

  const numericPosition = clamp(
    position,
    NUMERIC_SCALE_START_POSITION,
    NUMERIC_SCALE_END_POSITION
  );

  const value =
    scaleMinimum +
    ((numericPosition - NUMERIC_SCALE_START_POSITION) /
      (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION)) *
      (scaleMaximum - scaleMinimum);

  return roundToStep(value, step);
};

export const snapBoundaryPosition = (
  boundary: NumericBoundary,
  requestedPosition: number,
  otherPosition: number
): number => {
  if (boundary === 'min') {
    const position = clamp(
      requestedPosition,
      0,
      Math.min(NUMERIC_SCALE_END_POSITION, otherPosition)
    );

    if (position <= LEFT_NULL_SNAP_POSITION) {
      return 0;
    }

    return Math.max(position, NUMERIC_SCALE_START_POSITION);
  }

  const position = clamp(
    requestedPosition,
    Math.max(NUMERIC_SCALE_START_POSITION, otherPosition),
    100
  );

  if (position >= RIGHT_NULL_SNAP_POSITION) {
    return 100;
  }

  return Math.min(position, NUMERIC_SCALE_END_POSITION);
};
