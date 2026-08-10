import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';

import {
  buildDiaryFilterMarkedDates,
  getDiaryFilterCalendarCurrent,
} from '../lib/filterCalendar';
import type { NumericBoundary } from '../lib/numericRange';

import {
  areDiaryFilterRangesValid,
  areDiaryFiltersEqual,
  createDefaultDiaryFilters,
} from './filters';
import type {
  DiaryFilterDateBoundary,
  DiaryFilterNumericField,
  DiaryFilterNumericRange,
  DiaryFilterPresence,
  DiaryFilters,
} from './types';
import { DIARY_FILTER_NUMERIC_FIELDS } from './types';
import { useDiaryFilters } from './useDiaryFilters';

export type DiaryFilterNumericText = Record<
  DiaryFilterNumericField,
  Record<NumericBoundary, string>
>;

type NumericInputTimerKey = `${DiaryFilterNumericField}:${NumericBoundary}`;

type UseDiaryFiltersModalOptions = {
  onApply: () => void;
};

const NUMERIC_INPUT_PATTERN = /^\d*(?:[.,]\d?)?$/;

const NUMERIC_INPUT_DEBOUNCE_MS = 350;

const DEFAULT_DIARY_FILTERS = createDefaultDiaryFilters();

const formatNumericValue = (value: number | null): string =>
  value === null ? '' : String(value);

const createNumericText = (filters?: DiaryFilters): DiaryFilterNumericText => {
  const result = {} as DiaryFilterNumericText;

  DIARY_FILTER_NUMERIC_FIELDS.forEach((field) => {
    const range = filters?.[field];

    result[field] = {
      min: range === undefined ? '' : formatNumericValue(range.min),

      max: range === undefined ? '' : formatNumericValue(range.max),
    };
  });

  return result;
};

const parseNumericText = (text: string): number | null => {
  const normalizedText = text.replace(',', '.');

  if (normalizedText === '' || normalizedText === '.') {
    return null;
  }

  if (normalizedText.endsWith('.')) {
    const value = Number(normalizedText.slice(0, -1));

    return Number.isFinite(value) ? value : null;
  }

  const value = Number(normalizedText);

  return Number.isFinite(value) ? value : null;
};

export const useDiaryFiltersModal = ({
  onApply,
}: UseDiaryFiltersModalOptions) => {
  const theme = useTheme();

  const filters = useDiaryFilters();

  const draftFiltersRef = useRef(filters.draftFilters);

  draftFiltersRef.current = filters.draftFilters;

  const [numericText, setNumericText] = useState<DiaryFilterNumericText>(() =>
    createNumericText()
  );

  const numericInputTimersRef = useRef<
    Partial<Record<NumericInputTimerKey, ReturnType<typeof setTimeout>>>
  >({});

  const [pendingNumericInputKeys, setPendingNumericInputKeys] = useState<
    ReadonlySet<NumericInputTimerKey>
  >(() => new Set());

  const removePendingNumericInputKey = useCallback(
    (key: NumericInputTimerKey) => {
      setPendingNumericInputKeys((currentKeys) => {
        if (!currentKeys.has(key)) {
          return currentKeys;
        }

        const nextKeys = new Set(currentKeys);

        nextKeys.delete(key);

        return nextKeys;
      });
    },
    []
  );

  const cancelNumericInputTimer = useCallback(
    (
      field: DiaryFilterNumericField,

      boundary: NumericBoundary
    ) => {
      const key: NumericInputTimerKey = `${field}:${boundary}`;

      const timer = numericInputTimersRef.current[key];

      if (timer !== undefined) {
        clearTimeout(timer);

        delete numericInputTimersRef.current[key];
      }

      removePendingNumericInputKey(key);
    },
    [removePendingNumericInputKey]
  );

  const cancelAllNumericInputTimers = useCallback(() => {
    Object.values(numericInputTimersRef.current).forEach((timer) => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    });

    numericInputTimersRef.current = {};

    setPendingNumericInputKeys(new Set());
  }, []);

  useEffect(
    () => () => {
      Object.values(numericInputTimersRef.current).forEach((timer) => {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!filters.visible) {
      return;
    }

    cancelAllNumericInputTimers();

    setNumericText(createNumericText(draftFiltersRef.current));
  }, [cancelAllNumericInputTimers, filters.visible]);

  const markedDates = useMemo(
    () =>
      buildDiaryFilterMarkedDates({
        date: filters.draftFilters.date,

        primaryColor: theme.colors.primary,

        rangeColor: theme.colors.shades.primary.sm,

        textColor: theme.colors.text,
      }),
    [
      filters.draftFilters.date,
      theme.colors.primary,
      theme.colors.shades.primary.sm,
      theme.colors.text,
    ]
  );

  const calendarCurrent = getDiaryFilterCalendarCurrent(
    filters.draftFilters.date
  );

  const hasPendingNumericInput = pendingNumericInputKeys.size > 0;

  const rangesValid = areDiaryFilterRangesValid(filters.draftFilters);

  const canClear =
    hasPendingNumericInput ||
    !areDiaryFiltersEqual(filters.draftFilters, DEFAULT_DIARY_FILTERS);

  const isApplied =
    !hasPendingNumericInput &&
    rangesValid &&
    areDiaryFiltersEqual(filters.draftFilters, filters.appliedFilters);

  const canApply = !hasPendingNumericInput && rangesValid && !isApplied;

  const handleDayPress = useCallback(
    (dateString: string) => {
      filters.setDate(
        filters.draftFilters.date.activeBoundary,

        dateString
      );
    },
    [filters.draftFilters.date.activeBoundary, filters.setDate]
  );

  const handleClearDateBoundary = useCallback(
    (boundary: DiaryFilterDateBoundary) => {
      filters.setDate(boundary, null);

      filters.setActiveDateBoundary(boundary);
    },
    [filters.setActiveDateBoundary, filters.setDate]
  );

  const handleNumericTextChange = useCallback(
    (
      field: DiaryFilterNumericField,

      boundary: NumericBoundary,

      text: string
    ) => {
      if (!NUMERIC_INPUT_PATTERN.test(text)) {
        return;
      }

      setNumericText((currentText) => ({
        ...currentText,

        [field]: {
          ...currentText[field],

          [boundary]: text,
        },
      }));

      cancelNumericInputTimer(field, boundary);

      const key: NumericInputTimerKey = `${field}:${boundary}`;

      setPendingNumericInputKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);

        nextKeys.add(key);

        return nextKeys;
      });

      numericInputTimersRef.current[key] = setTimeout(() => {
        delete numericInputTimersRef.current[key];

        removePendingNumericInputKey(key);

        const currentRange = draftFiltersRef.current[field];

        filters.setNumericRange(field, {
          ...currentRange,

          [boundary]: parseNumericText(text),
        });
      }, NUMERIC_INPUT_DEBOUNCE_MS);
    },
    [
      cancelNumericInputTimer,
      filters.setNumericRange,
      removePendingNumericInputKey,
    ]
  );

  const handleNumericRangeChange = useCallback(
    (
      field: DiaryFilterNumericField,

      boundary: NumericBoundary,

      value: number | null
    ) => {
      cancelNumericInputTimer(field, boundary);

      const currentRange: DiaryFilterNumericRange =
        draftFiltersRef.current[field];

      filters.setNumericRange(field, {
        ...currentRange,
        [boundary]: value,
      });

      setNumericText((currentText) => ({
        ...currentText,

        [field]: {
          ...currentText[field],

          [boundary]: formatNumericValue(value),
        },
      }));
    },
    [cancelNumericInputTimer, filters.setNumericRange]
  );

  const handleResetNumericRange = useCallback(
    (field: DiaryFilterNumericField) => {
      cancelNumericInputTimer(field, 'min');

      cancelNumericInputTimer(field, 'max');

      filters.resetNumericRange(field);

      setNumericText((currentText) => ({
        ...currentText,

        [field]: {
          min: '',
          max: '',
        },
      }));
    },
    [cancelNumericInputTimer, filters.resetNumericRange]
  );

  const handlePresenceChange = useCallback(
    (
      field: 'photo' | 'aiAnalysis',

      value: DiaryFilterPresence
    ) => {
      filters.setPresence(field, value);
    },
    [filters.setPresence]
  );

  const handleClear = useCallback(() => {
    cancelAllNumericInputTimers();

    filters.clearDraft();

    setNumericText(createNumericText());
  }, [cancelAllNumericInputTimers, filters.clearDraft]);

  const handleClose = useCallback(() => {
    cancelAllNumericInputTimers();

    filters.close();
  }, [cancelAllNumericInputTimers, filters.close]);

  const handleApply = useCallback(() => {
    if (!canApply) {
      return;
    }

    onApply();
  }, [canApply, onApply]);

  return {
    visible: filters.visible,

    draftFilters: filters.draftFilters,

    numericText,

    markedDates,
    calendarCurrent,

    rangesValid,
    canClear,
    canApply,
    isApplied,

    handleClose,
    handleApply,
    handleClear,

    handleDayPress,

    handleClearDates: filters.clearDates,

    handleClearDateBoundary,

    handleActiveBoundaryChange: filters.setActiveDateBoundary,

    handleNumericTextChange,
    handleNumericRangeChange,
    handleResetNumericRange,

    handleToggleMealRelation: filters.toggleMealRelation,

    handlePresenceChange,
  };
};
