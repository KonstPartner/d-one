import { useCallback, useRef, useState } from 'react';

import useCreateDiaryEntry from '../../api/hooks/useCreateDiaryEntry';
import type {
  CreateDiaryEntryData,
  DiaryEntryFormError,
  MealRelation,
} from '../types';

type UseCreateDiaryEntryFormParams = {
  onCreated: (entryId: string) => void;
};

const GLUCOSE_MAXIMUM = 100;
const METRIC_MAXIMUM = 1000;
const COMMENT_MAXIMUM_LENGTH = 5000;
const DECIMAL_PRECISION_TOLERANCE = 1e-8;

const createInitialValues = (): CreateDiaryEntryData => {
  const eventAt = new Date();

  eventAt.setSeconds(0, 0);

  return {
    glucose: null,
    mealRelation: null,
    shortInsulin: null,
    longInsulin: null,
    carbsGram: null,
    comment: '',
    eventAt,
  };
};

const hasMaximumOneDecimalPlace = (value: number): boolean => {
  const shiftedValue = value * 10;

  return (
    Math.abs(shiftedValue - Math.round(shiftedValue)) <
    DECIMAL_PRECISION_TOLERANCE
  );
};

const isValidMetric = (value: number | null, maximum: number): boolean =>
  value === null ||
  (Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum &&
    hasMaximumOneDecimalPlace(value));

const isMeaningfulEntry = (values: CreateDiaryEntryData): boolean =>
  values.glucose !== null ||
  values.mealRelation !== null ||
  values.shortInsulin !== null ||
  values.longInsulin !== null ||
  values.carbsGram !== null ||
  values.comment.length > 0;

const validateValues = (
  values: CreateDiaryEntryData
): DiaryEntryFormError | null => {
  if (Number.isNaN(values.eventAt.getTime())) {
    return 'invalidEventAt';
  }

  if (!isValidMetric(values.glucose, GLUCOSE_MAXIMUM)) {
    return 'invalidGlucose';
  }

  if (!isValidMetric(values.shortInsulin, METRIC_MAXIMUM)) {
    return 'invalidShortInsulin';
  }

  if (!isValidMetric(values.longInsulin, METRIC_MAXIMUM)) {
    return 'invalidLongInsulin';
  }

  if (!isValidMetric(values.carbsGram, METRIC_MAXIMUM)) {
    return 'invalidCarbsGram';
  }

  if (values.comment.length > COMMENT_MAXIMUM_LENGTH) {
    return 'commentTooLong';
  }

  if (!isMeaningfulEntry(values)) {
    return 'emptyEntry';
  }

  return null;
};

const useCreateDiaryEntryForm = ({
  onCreated,
}: UseCreateDiaryEntryFormParams) => {
  const [values, setValues] =
    useState<CreateDiaryEntryData>(createInitialValues);
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(true);
  const [validationError, setValidationError] =
    useState<DiaryEntryFormError | null>(null);

  const submitInProgressRef = useRef(false);
  const initialValuesRef = useRef(values);

  const {
    mutateAsync,
    reset: resetCreation,
    error: creationError,
    isPending,
  } = useCreateDiaryEntry();

  const clearErrors = useCallback(() => {
    setValidationError(null);
    resetCreation();
  }, [resetCreation]);

  const updateValue = useCallback(
    <Key extends keyof CreateDiaryEntryData>(
      key: Key,
      value: CreateDiaryEntryData[Key]
    ) => {
      clearErrors();

      setValues((currentValues) => ({
        ...currentValues,
        [key]: value,
      }));
    },
    [clearErrors]
  );

  const handleGlucoseChange = useCallback(
    (value: number | null) => {
      updateValue('glucose', value);
    },
    [updateValue]
  );

  const handleMealRelationChange = useCallback(
    (value: MealRelation | null) => {
      updateValue('mealRelation', value);
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

  const handleCarbsGramChange = useCallback(
    (value: number | null) => {
      updateValue('carbsGram', value);
    },
    [updateValue]
  );

  const handleCommentChange = useCallback(
    (value: string) => {
      updateValue('comment', value);
    },
    [updateValue]
  );

  const handleCurrentDateTimeChange = useCallback(
    (value: boolean) => {
      clearErrors();
      setUseCurrentDateTime(value);
    },
    [clearErrors]
  );

  const handleEventDateChange = useCallback(
    (date: Date) => {
      if (useCurrentDateTime || Number.isNaN(date.getTime())) {
        return;
      }

      clearErrors();

      setValues((currentValues) => {
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
    [clearErrors, useCurrentDateTime]
  );

  const handleEventTimeChange = useCallback(
    (time: Date) => {
      if (useCurrentDateTime || Number.isNaN(time.getTime())) {
        return;
      }

      clearErrors();

      setValues((currentValues) => {
        const eventAt = new Date(currentValues.eventAt);

        eventAt.setHours(time.getHours(), time.getMinutes(), 0, 0);

        return {
          ...currentValues,
          eventAt,
        };
      });
    },
    [clearErrors, useCurrentDateTime]
  );

  const handleSubmit = useCallback(async (): Promise<string | null> => {
    if (submitInProgressRef.current) {
      return null;
    }

    const normalizedValues: CreateDiaryEntryData = {
      ...values,
      comment: values.comment.trim(),
      eventAt: useCurrentDateTime ? new Date() : new Date(values.eventAt),
    };

    const nextValidationError = validateValues(normalizedValues);

    if (nextValidationError !== null) {
      resetCreation();
      setValidationError(nextValidationError);

      return null;
    }

    submitInProgressRef.current = true;
    setValidationError(null);

    try {
      const entryId = await mutateAsync(normalizedValues);

      onCreated(entryId);

      return entryId;
    } catch {
      return null;
    } finally {
      submitInProgressRef.current = false;
    }
  }, [mutateAsync, onCreated, resetCreation, useCurrentDateTime, values]);

  const initialValues = initialValuesRef.current;

  const isDirty =
    useCurrentDateTime !== true ||
    values.eventAt.getTime() !== initialValues.eventAt.getTime() ||
    values.glucose !== initialValues.glucose ||
    values.mealRelation !== initialValues.mealRelation ||
    values.shortInsulin !== initialValues.shortInsulin ||
    values.longInsulin !== initialValues.longInsulin ||
    values.carbsGram !== initialValues.carbsGram ||
    values.comment !== initialValues.comment;

  return {
    values,
    useCurrentDateTime,
    isDirty,
    validationError,
    creationError,
    isSubmitting: isPending,
    handleGlucoseChange,
    handleMealRelationChange,
    handleShortInsulinChange,
    handleLongInsulinChange,
    handleCarbsGramChange,
    handleCommentChange,
    handleCurrentDateTimeChange,
    handleEventDateChange,
    handleEventTimeChange,
    handleSubmit,
  };
};

export default useCreateDiaryEntryForm;
