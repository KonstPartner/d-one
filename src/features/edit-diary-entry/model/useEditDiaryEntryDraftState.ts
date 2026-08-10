import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  DiaryEntry,
  DiaryEntryEditableValues,
  MealRelation,
} from '@entities/diary';

import { createEditDiaryEntryValues } from './editDiaryEntryDraft';

type UseEditDiaryEntryDraftStateParams = {
  visible: boolean;
  entry: DiaryEntry | null;
};

export const useEditDiaryEntryDraftState = ({
  visible,
  entry,
}: UseEditDiaryEntryDraftStateParams) => {
  const [values, setValues] = useState<DiaryEntryEditableValues | null>(null);

  const [useCurrentDateTime, setUseCurrentDateTime] = useState(false);

  const activeEntryIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visible) {
      activeEntryIdRef.current = null;

      return;
    }

    if (entry === null) {
      setValues(null);
      setUseCurrentDateTime(false);

      return;
    }

    if (activeEntryIdRef.current === entry.id) {
      return;
    }

    activeEntryIdRef.current = entry.id;

    setValues(createEditDiaryEntryValues(entry));

    setUseCurrentDateTime(false);
  }, [entry, visible]);

  const updateValue = useCallback(
    <Key extends keyof DiaryEntryEditableValues>(
      key: Key,
      value: DiaryEntryEditableValues[Key]
    ) => {
      setValues((currentValues) => {
        if (currentValues === null) {
          return null;
        }

        return {
          ...currentValues,
          [key]: value,
        };
      });
    },
    []
  );

  const handleGlucoseChange = useCallback(
    (value: number | null) => {
      updateValue('glucose', value);
    },
    [updateValue]
  );

  const handleCarbsGramChange = useCallback(
    (value: number | null) => {
      updateValue('carbsGram', value);
    },
    [updateValue]
  );

  const handleShortInsulinChange = useCallback(
    (value: number | null) => {
      updateValue('shortInsulin', value);
    },
    [updateValue]
  );

  const handleLongInsulinChange = useCallback(
    (value: number | null) => {
      updateValue('longInsulin', value);
    },
    [updateValue]
  );

  const handleMealRelationChange = useCallback(
    (value: MealRelation | null) => {
      updateValue('mealRelation', value);
    },
    [updateValue]
  );

  const handleCommentChange = useCallback(
    (value: string) => {
      updateValue('comment', value);
    },
    [updateValue]
  );

  const handleCurrentDateTimeChange = useCallback((value: boolean) => {
    setUseCurrentDateTime(value);
  }, []);

  const handleEventDateChange = useCallback(
    (date: Date) => {
      if (useCurrentDateTime || Number.isNaN(date.getTime())) {
        return;
      }

      setValues((currentValues) => {
        if (currentValues === null) {
          return null;
        }

        const eventAt = new Date(currentValues.eventAt);

        eventAt.setFullYear(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        return {
          ...currentValues,
          eventAt,
        };
      });
    },
    [useCurrentDateTime]
  );

  const handleEventTimeChange = useCallback(
    (time: Date) => {
      if (useCurrentDateTime || Number.isNaN(time.getTime())) {
        return;
      }

      setValues((currentValues) => {
        if (currentValues === null) {
          return null;
        }

        const eventAt = new Date(currentValues.eventAt);

        eventAt.setHours(time.getHours(), time.getMinutes(), 0, 0);

        return {
          ...currentValues,
          eventAt,
        };
      });
    },
    [useCurrentDateTime]
  );

  return {
    values,
    useCurrentDateTime,

    handleGlucoseChange,
    handleCarbsGramChange,
    handleShortInsulinChange,
    handleLongInsulinChange,

    handleMealRelationChange,
    handleCommentChange,

    handleCurrentDateTimeChange,
    handleEventDateChange,
    handleEventTimeChange,
  };
};
