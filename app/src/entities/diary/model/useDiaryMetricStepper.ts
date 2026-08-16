import { useCallback, useEffect, useRef, useState } from 'react';

type UseDiaryMetricStepperParams = {
  value: number | null;
  maximum: number;
  step: number;
  longPressStep: number;
  disabled: boolean;
  onChange: (value: number | null) => void;
};

const MINIMUM_VALUE = 0;
const LONG_PRESS_DELAY_MS = 400;
const LONG_PRESS_REPEAT_MS = 300;

const VALID_INPUT_PATTERN = /^(?:\d+(?:[.,]\d?)?)?$/;

const formatValue = (value: number | null): string =>
  value === null ? '' : String(value);

const parseValue = (value: string): number | null => {
  if (value.length === 0) {
    return null;
  }

  const parsedValue = Number(value.replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const normalizeStepResult = (value: number): number =>
  Number(value.toFixed(10));

export const useDiaryMetricStepper = ({
  value,
  maximum,
  step,
  longPressStep,
  disabled,
  onChange,
}: UseDiaryMetricStepperParams) => {
  const [inputValue, setInputValue] = useState(() => formatValue(value));

  const currentValueRef = useRef<number | null>(value);

  const longPressHandledRef = useRef(false);

  const longPressDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRepeatRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    const parsedInputValue = parseValue(inputValue);

    currentValueRef.current = parsedInputValue ?? value;

    if (value === null) {
      if (inputValue.length > 0) {
        setInputValue('');
      }

      return;
    }

    if (parsedInputValue !== value) {
      setInputValue(formatValue(value));
    }
  }, [inputValue, value]);

  const clearLongPressTimers = useCallback(() => {
    if (longPressDelayRef.current !== null) {
      clearTimeout(longPressDelayRef.current);
      longPressDelayRef.current = null;
    }

    if (longPressRepeatRef.current !== null) {
      clearInterval(longPressRepeatRef.current);
      longPressRepeatRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearLongPressTimers();
    },
    [clearLongPressTimers]
  );

  useEffect(() => {
    if (disabled) {
      clearLongPressTimers();
    }
  }, [clearLongPressTimers, disabled]);

  const applyDelta = useCallback(
    (delta: number) => {
      if (disabled) {
        return;
      }

      const currentValue = currentValueRef.current;

      if (currentValue === null && delta < 0) {
        return;
      }

      if (currentValue !== null && delta > 0 && currentValue >= maximum) {
        return;
      }

      if (currentValue === MINIMUM_VALUE && delta < 0) {
        currentValueRef.current = null;
        setInputValue('');
        onChange(null);

        return;
      }

      const nextValue = normalizeStepResult(
        Math.min(
          maximum,
          Math.max(MINIMUM_VALUE, (currentValue ?? MINIMUM_VALUE) + delta)
        )
      );

      currentValueRef.current = nextValue;
      setInputValue(formatValue(nextValue));
      onChange(nextValue);
    },
    [disabled, maximum, onChange]
  );

  const startLongPress = useCallback(
    (delta: number) => {
      clearLongPressTimers();

      longPressHandledRef.current = false;

      longPressDelayRef.current = setTimeout(() => {
        longPressDelayRef.current = null;
        longPressHandledRef.current = true;

        applyDelta(delta);

        longPressRepeatRef.current = setInterval(() => {
          applyDelta(delta);
        }, LONG_PRESS_REPEAT_MS);
      }, LONG_PRESS_DELAY_MS);
    },
    [applyDelta, clearLongPressTimers]
  );

  const handleChangeText = useCallback(
    (nextInputValue: string) => {
      if (disabled || !VALID_INPUT_PATTERN.test(nextInputValue)) {
        return;
      }

      setInputValue(nextInputValue);

      if (nextInputValue.length === 0) {
        currentValueRef.current = null;
        onChange(null);

        return;
      }

      const nextValue = parseValue(nextInputValue);

      if (
        nextValue !== null &&
        nextValue >= MINIMUM_VALUE &&
        nextValue <= maximum
      ) {
        currentValueRef.current = nextValue;
        onChange(nextValue);
      }
    },
    [disabled, maximum, onChange]
  );

  const handleBlur = useCallback(() => {
    setInputValue(formatValue(value));
  }, [value]);

  const handleDecrementPressIn = useCallback(() => {
    startLongPress(-longPressStep);
  }, [longPressStep, startLongPress]);

  const handleDecrementPressOut = useCallback(() => {
    clearLongPressTimers();
  }, [clearLongPressTimers]);

  const handleDecrementPress = useCallback(() => {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;

      return;
    }

    applyDelta(-step);
  }, [applyDelta, step]);

  const handleIncrementPressIn = useCallback(() => {
    startLongPress(longPressStep);
  }, [longPressStep, startLongPress]);

  const handleIncrementPressOut = useCallback(() => {
    clearLongPressTimers();
  }, [clearLongPressTimers]);

  const handleIncrementPress = useCallback(() => {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;

      return;
    }

    applyDelta(step);
  }, [applyDelta, step]);

  const currentValue = parseValue(inputValue) ?? value;

  return {
    inputValue,

    decrementDisabled: disabled || currentValue === null,

    incrementDisabled:
      disabled || (currentValue !== null && currentValue >= maximum),

    handleChangeText,
    handleBlur,

    handleDecrementPressIn,
    handleDecrementPressOut,
    handleDecrementPress,

    handleIncrementPressIn,
    handleIncrementPressOut,
    handleIncrementPress,
  };
};
