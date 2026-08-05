import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import type { DateData } from 'react-native-calendars';
import { useShallow } from 'zustand/react/shallow';

import { useDiaryListStore } from '../store';
import type {
  DiaryFilterDateBoundary,
  DiaryFilterNumericField,
  DiaryFilterPresence,
} from '../types';
import {
  areDiaryFilterControlsEqual,
  areDiaryFilterRangesValid,
  areDiaryFiltersEqual,
  createDefaultDiaryFilters,
} from '../types';

type NumericBoundary = 'min' | 'max';

type DiaryFilterNumericText = Record<
  DiaryFilterNumericField,
  Record<NumericBoundary, string>
>;

type NumericInputTimerKey = `${DiaryFilterNumericField}:${NumericBoundary}`;

export type DiaryFilterMarkedDate = {
  color: string;
  textColor: string;
  startingDay?: boolean;
  endingDay?: boolean;
};

export type DiaryFilterMarkedDates = Record<string, DiaryFilterMarkedDate>;

const NUMERIC_INPUT_PATTERN = /^\d*(?:[.,]\d?)?$/;
const NUMERIC_INPUT_DEBOUNCE_MS = 350;

const createEmptyNumericText = (): DiaryFilterNumericText => ({
  glucose: { min: '', max: '' },
  shortInsulin: { min: '', max: '' },
  longInsulin: { min: '', max: '' },
  carbsGram: { min: '', max: '' },
});

const formatNumericValue = (value: number | null): string =>
  value === null ? '' : String(value);

const createNumericTextFromFilters = (
  filters: ReturnType<typeof createDefaultDiaryFilters>
): DiaryFilterNumericText => ({
  glucose: {
    min: formatNumericValue(filters.glucose.min),
    max: formatNumericValue(filters.glucose.max),
  },
  shortInsulin: {
    min: formatNumericValue(filters.shortInsulin.min),
    max: formatNumericValue(filters.shortInsulin.max),
  },
  longInsulin: {
    min: formatNumericValue(filters.longInsulin.min),
    max: formatNumericValue(filters.longInsulin.max),
  },
  carbsGram: {
    min: formatNumericValue(filters.carbsGram.min),
    max: formatNumericValue(filters.carbsGram.max),
  },
});

const parseNumericText = (text: string): number | null => {
  const normalizedText = text.replace(',', '.');

  if (
    normalizedText === '' ||
    normalizedText === '.' ||
    normalizedText.endsWith('.')
  ) {
    return normalizedText === '' || normalizedText === '.'
      ? null
      : Number(normalizedText.slice(0, -1));
  }

  const value = Number(normalizedText);

  return Number.isFinite(value) ? value : null;
};

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateKey = (date: Date): string =>
  [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');

const formatLocalDateKey = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const addUtcDay = (date: Date): Date => {
  const nextDate = new Date(date);

  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return nextDate;
};

const buildMarkedDates = (
  from: string | null,
  to: string | null,
  primaryColor: string,
  rangeColor: string,
  textColor: string
): DiaryFilterMarkedDates => {
  if (from === null && to === null) {
    return {};
  }

  const startKey = from ?? to;
  const endKey = to ?? from;

  if (startKey === null || endKey === null) {
    return {};
  }

  const markedDates: DiaryFilterMarkedDates = {};
  const endDate = parseDateKey(endKey);

  for (
    let currentDate = parseDateKey(startKey);
    currentDate.getTime() <= endDate.getTime();
    currentDate = addUtcDay(currentDate)
  ) {
    const dateKey = formatDateKey(currentDate);
    const startingDay = dateKey === startKey;
    const endingDay = dateKey === endKey;

    markedDates[dateKey] = {
      color: startingDay || endingDay ? primaryColor : rangeColor,
      textColor: startingDay || endingDay ? '#ffffff' : textColor,
      startingDay,
      endingDay,
    };
  }

  return markedDates;
};

const useDiaryFilters = () => {
  const theme = useTheme();

  const {
    visible,
    draftFilters,
    appliedFilters,
    closeFilterModal,
    setFilterActiveBoundary,
    setFilterDate,
    clearFilterDates,
    setFilterNumericRange,
    resetFilterNumericRange,
    toggleFilterMealRelation,
    setFilterPresence,
    clearFilterDraft,
    applyFilterDraft,
  } = useDiaryListStore(
    useShallow((state) => ({
      visible: state.filterModalVisible,
      draftFilters: state.draftFilters,
      appliedFilters: state.appliedFilters,
      closeFilterModal: state.closeFilterModal,
      setFilterActiveBoundary: state.setFilterActiveBoundary,
      setFilterDate: state.setFilterDate,
      clearFilterDates: state.clearFilterDates,
      setFilterNumericRange: state.setFilterNumericRange,
      resetFilterNumericRange: state.resetFilterNumericRange,
      toggleFilterMealRelation: state.toggleFilterMealRelation,
      setFilterPresence: state.setFilterPresence,
      clearFilterDraft: state.clearFilterDraft,
      applyFilterDraft: state.applyFilterDraft,
    }))
  );

  const [numericText, setNumericText] = useState<DiaryFilterNumericText>(
    createEmptyNumericText
  );
  const numericInputTimersRef = useRef<
    Partial<Record<NumericInputTimerKey, ReturnType<typeof setTimeout>>>
  >({});
  const [pendingNumericInputKeys, setPendingNumericInputKeys] = useState<
    ReadonlySet<NumericInputTimerKey>
  >(new Set());

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
    (field: DiaryFilterNumericField, boundary: NumericBoundary) => {
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
    if (!visible) {
      return;
    }

    cancelAllNumericInputTimers();
    setNumericText(
      createNumericTextFromFilters(useDiaryListStore.getState().draftFilters)
    );
  }, [cancelAllNumericInputTimers, visible]);

  const markedDates = useMemo(
    () =>
      buildMarkedDates(
        draftFilters.date.from,
        draftFilters.date.to,
        theme.colors.primary,
        theme.colors.shades.primary.sm,
        theme.colors.text
      ),
    [
      draftFilters.date.from,
      draftFilters.date.to,
      theme.colors.primary,
      theme.colors.shades.primary.sm,
      theme.colors.text,
    ]
  );

  const hasPendingNumericInput = pendingNumericInputKeys.size > 0;
  const canClear = useMemo(
    () =>
      hasPendingNumericInput ||
      !areDiaryFilterControlsEqual(draftFilters, createDefaultDiaryFilters()),
    [draftFilters, hasPendingNumericInput]
  );

  const rangesValid = areDiaryFilterRangesValid(draftFilters);
  const canApply =
    !hasPendingNumericInput &&
    rangesValid &&
    !areDiaryFiltersEqual(draftFilters, appliedFilters);
  const isApplied =
    !hasPendingNumericInput &&
    rangesValid &&
    areDiaryFiltersEqual(draftFilters, appliedFilters);
  const calendarCurrent =
    draftFilters.date.from ??
    draftFilters.date.to ??
    formatLocalDateKey(new Date());

  const handleDayPress = useCallback(
    ({ dateString }: DateData) => {
      setFilterDate(draftFilters.date.activeBoundary, dateString);
    },
    [draftFilters.date.activeBoundary, setFilterDate]
  );

  const handleClearDateBoundary = useCallback(
    (boundary: DiaryFilterDateBoundary) => {
      setFilterDate(boundary, null);
      setFilterActiveBoundary(boundary);
    },
    [setFilterActiveBoundary, setFilterDate]
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

        const currentRange = useDiaryListStore.getState().draftFilters[field];

        setFilterNumericRange(field, {
          ...currentRange,
          [boundary]: parseNumericText(text),
        });
      }, NUMERIC_INPUT_DEBOUNCE_MS);
    },
    [
      cancelNumericInputTimer,
      removePendingNumericInputKey,
      setFilterNumericRange,
    ]
  );

  const handleNumericRangeChange = useCallback(
    (
      field: DiaryFilterNumericField,
      boundary: NumericBoundary,
      value: number | null
    ) => {
      cancelNumericInputTimer(field, boundary);

      const currentRange = useDiaryListStore.getState().draftFilters[field];

      setFilterNumericRange(field, {
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
    [cancelNumericInputTimer, setFilterNumericRange]
  );

  const handleResetNumericRange = useCallback(
    (field: DiaryFilterNumericField) => {
      cancelNumericInputTimer(field, 'min');
      cancelNumericInputTimer(field, 'max');
      resetFilterNumericRange(field);
      setNumericText((currentText) => ({
        ...currentText,
        [field]: { min: '', max: '' },
      }));
    },
    [cancelNumericInputTimer, resetFilterNumericRange]
  );

  const handleClear = useCallback(() => {
    cancelAllNumericInputTimers();
    clearFilterDraft();
    setNumericText(createEmptyNumericText());
  }, [cancelAllNumericInputTimers, clearFilterDraft]);

  const handleClose = useCallback(() => {
    cancelAllNumericInputTimers();
    closeFilterModal();
  }, [cancelAllNumericInputTimers, closeFilterModal]);

  const handleApply = useCallback(() => {
    if (!canApply) {
      return;
    }

    applyFilterDraft();
  }, [applyFilterDraft, canApply]);

  return {
    visible,
    draftFilters,
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
    handleClearDates: clearFilterDates,
    handleClearDateBoundary,
    handleActiveBoundaryChange: setFilterActiveBoundary,
    handleNumericTextChange,
    handleNumericRangeChange,
    handleResetNumericRange,
    handleToggleMealRelation: toggleFilterMealRelation,
    handlePresenceChange: (
      field: 'photo' | 'aiAnalysis',
      value: DiaryFilterPresence
    ) => setFilterPresence(field, value),
  };
};

export default useDiaryFilters;
