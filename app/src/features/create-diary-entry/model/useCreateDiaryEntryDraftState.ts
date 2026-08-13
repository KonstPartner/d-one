import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type DiaryEntryEditableValues,
  type MealRelation,
} from '@entities/diary';

import {
  type CreateDiaryEntryDraft,
  createInitialCreateDiaryEntryDraft,
} from './createDiaryEntryDraft';

type UseCreateDiaryEntryDraftStateParams = {
  visible: boolean;
};

export const useCreateDiaryEntryDraftState = ({
  visible,
}: UseCreateDiaryEntryDraftStateParams) => {
  const initialDraftRef = useRef<CreateDiaryEntryDraft | null>(null);

  if (initialDraftRef.current === null) {
    initialDraftRef.current = createInitialCreateDiaryEntryDraft();
  }

  const [values, setValues] = useState<DiaryEntryEditableValues>(
    initialDraftRef.current.values
  );

  const [useCurrentDateTime, setUseCurrentDateTime] = useState(
    initialDraftRef.current.useCurrentDateTime
  );

  const draftRef = useRef<CreateDiaryEntryDraft>(initialDraftRef.current);

  useEffect(() => {
    if (!visible || draftRef.current.changed) {
      return;
    }

    const nextDraft = createInitialCreateDiaryEntryDraft();

    draftRef.current = nextDraft;

    setValues(nextDraft.values);

    setUseCurrentDateTime(nextDraft.useCurrentDateTime);
  }, [visible]);

  const resetDraft = useCallback(() => {
    const nextDraft = createInitialCreateDiaryEntryDraft();

    draftRef.current = nextDraft;

    setValues(nextDraft.values);

    setUseCurrentDateTime(nextDraft.useCurrentDateTime);
  }, []);

  const updateValue = useCallback(
    <Key extends keyof DiaryEntryEditableValues>(
      key: Key,
      value: DiaryEntryEditableValues[Key]
    ) => {
      setValues((currentValues) => {
        const nextValues = {
          ...currentValues,
          [key]: value,
        };

        draftRef.current = {
          ...draftRef.current,
          values: nextValues,
          changed: true,
        };

        return nextValues;
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

    draftRef.current = {
      ...draftRef.current,
      useCurrentDateTime: value,
      changed: true,
    };
  }, []);

  const handleEventDateChange = useCallback(
    (date: Date) => {
      if (useCurrentDateTime || Number.isNaN(date.getTime())) {
        return;
      }

      setValues((currentValues) => {
        const eventAt = new Date(currentValues.eventAt);

        eventAt.setFullYear(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        const nextValues = {
          ...currentValues,
          eventAt,
        };

        draftRef.current = {
          ...draftRef.current,
          values: nextValues,
          changed: true,
        };

        return nextValues;
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
        const eventAt = new Date(currentValues.eventAt);

        eventAt.setHours(time.getHours(), time.getMinutes(), 0, 0);

        const nextValues = {
          ...currentValues,
          eventAt,
        };

        draftRef.current = {
          ...draftRef.current,
          values: nextValues,
          changed: true,
        };

        return nextValues;
      });
    },
    [useCurrentDateTime]
  );

  return {
    values,
    useCurrentDateTime,

    resetDraft,

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
