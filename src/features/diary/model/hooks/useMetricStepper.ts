import { useCallback, useEffect, useRef, useState } from 'react';

type UseMetricStepperParams = {
  value: number | null;
  disabled: boolean;
  onChange: (value: number | null) => void;
};

const STEP = 1;
const LONG_PRESS_STEP = 5;
const MINIMUM_VALUE = 0;

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

const useMetricStepper = ({
  value,
  disabled,
  onChange,
}: UseMetricStepperParams) => {
  const [inputValue, setInputValue] = useState(() => formatValue(value));

  const decrementLongPressHandled = useRef(false);
  const incrementLongPressHandled = useRef(false);

  useEffect(() => {
    const parsedInputValue = parseValue(inputValue);

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

  const applyDelta = useCallback(
    (delta: number) => {
      if (disabled) {
        return;
      }

      const currentValue = parseValue(inputValue) ?? value ?? MINIMUM_VALUE;

      const nextValue = normalizeStepResult(
        Math.max(MINIMUM_VALUE, currentValue + delta)
      );

      setInputValue(formatValue(nextValue));
      onChange(nextValue);
    },
    [disabled, inputValue, onChange, value]
  );

  const handleChangeText = useCallback(
    (nextInputValue: string) => {
      if (disabled || !VALID_INPUT_PATTERN.test(nextInputValue)) {
        return;
      }

      setInputValue(nextInputValue);

      if (nextInputValue.length === 0) {
        onChange(null);

        return;
      }

      const nextValue = parseValue(nextInputValue);

      if (nextValue !== null && nextValue >= MINIMUM_VALUE) {
        onChange(nextValue);
      }
    },
    [disabled, onChange]
  );

  const handleBlur = useCallback(() => {
    setInputValue(formatValue(value));
  }, [value]);

  const handleClear = useCallback(() => {
    if (disabled) {
      return;
    }

    setInputValue('');
    onChange(null);
  }, [disabled, onChange]);

  const handleDecrementPressIn = useCallback(() => {
    decrementLongPressHandled.current = false;
  }, []);

  const handleDecrementLongPress = useCallback(() => {
    decrementLongPressHandled.current = true;
    applyDelta(-LONG_PRESS_STEP);
  }, [applyDelta]);

  const handleDecrementPress = useCallback(() => {
    if (decrementLongPressHandled.current) {
      decrementLongPressHandled.current = false;

      return;
    }

    applyDelta(-STEP);
  }, [applyDelta]);

  const handleIncrementPressIn = useCallback(() => {
    incrementLongPressHandled.current = false;
  }, []);

  const handleIncrementLongPress = useCallback(() => {
    incrementLongPressHandled.current = true;
    applyDelta(LONG_PRESS_STEP);
  }, [applyDelta]);

  const handleIncrementPress = useCallback(() => {
    if (incrementLongPressHandled.current) {
      incrementLongPressHandled.current = false;

      return;
    }

    applyDelta(STEP);
  }, [applyDelta]);

  const currentValue = parseValue(inputValue) ?? value;

  return {
    inputValue,
    decrementDisabled:
      disabled || currentValue === null || currentValue <= MINIMUM_VALUE,
    clearDisabled: disabled || (value === null && inputValue.length === 0),
    handleChangeText,
    handleBlur,
    handleClear,
    handleDecrementPressIn,
    handleDecrementLongPress,
    handleDecrementPress,
    handleIncrementPressIn,
    handleIncrementLongPress,
    handleIncrementPress,
  };
};

export default useMetricStepper;
