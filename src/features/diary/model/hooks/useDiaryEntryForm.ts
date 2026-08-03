import { useCallback, useEffect, useRef, useState } from 'react';

import useCreateDiaryEntry from '../../api/hooks/useCreateDiaryEntry';
import useUpdateDiaryEntry, {
  type UpdateDiaryEntryPhotoChange,
} from '../../api/hooks/useUpdateDiaryEntry';
import type {
  CreateDiaryEntryData,
  DiaryEntry,
  DiaryEntryFormError,
  DiaryEntryFormMode,
  MealRelation,
} from '../types';

import useDiaryEntryFormPhoto from './useDiaryEntryFormPhoto';

type UseDiaryEntryFormParams = {
  visible: boolean;
  mode: DiaryEntryFormMode;
  entry: DiaryEntry | null;
  onSaved: (entryId: string) => void;
};

type CreateDraft = {
  values: CreateDiaryEntryData;
  useCurrentDateTime: boolean;
  changed: boolean;
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

const createInitialDraft = (): CreateDraft => ({
  values: createInitialValues(),
  useCurrentDateTime: true,
  changed: false,
});

const createValuesFromEntry = (entry: DiaryEntry): CreateDiaryEntryData => ({
  glucose: entry.glucose,
  mealRelation: entry.mealRelation,
  shortInsulin: entry.shortInsulin,
  longInsulin: entry.longInsulin,
  carbsGram: entry.carbsGram,
  comment: entry.comment,
  eventAt: new Date(entry.eventAt),
});

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

const isMeaningfulEntry = (
  values: CreateDiaryEntryData,
  hasPhoto: boolean
): boolean =>
  values.glucose !== null ||
  values.mealRelation !== null ||
  values.shortInsulin !== null ||
  values.longInsulin !== null ||
  values.carbsGram !== null ||
  values.comment.length > 0 ||
  hasPhoto;

const validateValues = (
  values: CreateDiaryEntryData,
  hasPhoto: boolean
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

  if (!isMeaningfulEntry(values, hasPhoto)) {
    return 'emptyEntry';
  }

  return null;
};

const useDiaryEntryForm = ({
  visible,
  mode,
  entry,
  onSaved,
}: UseDiaryEntryFormParams) => {
  const initialDraftRef = useRef<CreateDraft | null>(null);

  if (initialDraftRef.current === null) {
    initialDraftRef.current = createInitialDraft();
  }

  const [values, setValues] = useState<CreateDiaryEntryData>(
    initialDraftRef.current.values
  );
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(
    initialDraftRef.current.useCurrentDateTime
  );
  const [validationError, setValidationError] =
    useState<DiaryEntryFormError | null>(null);

  const createDraftRef = useRef<CreateDraft>(initialDraftRef.current);
  const activeFormKeyRef = useRef<string | null>(null);
  const submitInProgressRef = useRef(false);

  const createMutation = useCreateDiaryEntry();
  const updateMutation = useUpdateDiaryEntry();
  const {
    photoUri,
    photoDraftUri,
    photoAction,
    photoError,
    hasPhoto,
    hasTemporaryPhoto,
    isPhotoBusy,
    handleChoosePhoto,
    handleDeletePhoto,
    discardPhotoChanges,
    markPhotoSaved,
  } = useDiaryEntryFormPhoto({
    visible,
    mode,
    entry,
  });

  const clearErrors = useCallback(() => {
    setValidationError(null);
    createMutation.reset();
    updateMutation.reset();
  }, [createMutation, updateMutation]);

  const resetCreateDraft = useCallback(() => {
    const nextDraft = createInitialDraft();

    createDraftRef.current = nextDraft;

    if (mode === 'create') {
      setValues(nextDraft.values);
      setUseCurrentDateTime(nextDraft.useCurrentDateTime);
    }

    setValidationError(null);
    createMutation.reset();
  }, [createMutation, mode]);

  useEffect(() => {
    if (!visible) {
      activeFormKeyRef.current = null;

      return;
    }

    const formKey = mode === 'create' ? 'create' : `edit:${entry?.id ?? ''}`;

    if (activeFormKeyRef.current === formKey) {
      return;
    }

    activeFormKeyRef.current = formKey;
    clearErrors();

    if (mode === 'create') {
      if (!createDraftRef.current.changed) {
        createDraftRef.current = createInitialDraft();
      }

      setValues(createDraftRef.current.values);
      setUseCurrentDateTime(createDraftRef.current.useCurrentDateTime);

      return;
    }

    if (entry !== null) {
      setValues(createValuesFromEntry(entry));
      setUseCurrentDateTime(false);
    }
  }, [clearErrors, entry, mode, visible]);

  const updateValue = useCallback(
    <Key extends keyof CreateDiaryEntryData>(
      key: Key,
      value: CreateDiaryEntryData[Key]
    ) => {
      clearErrors();

      setValues((currentValues) => {
        const nextValues = {
          ...currentValues,
          [key]: value,
        };

        if (mode === 'create') {
          createDraftRef.current = {
            ...createDraftRef.current,
            values: nextValues,
            changed: true,
          };
        }

        return nextValues;
      });
    },
    [clearErrors, mode]
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

      if (mode === 'create') {
        createDraftRef.current = {
          ...createDraftRef.current,
          useCurrentDateTime: value,
          changed: true,
        };
      }
    },
    [clearErrors, mode]
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

        const nextValues = {
          ...currentValues,
          eventAt,
        };

        if (mode === 'create') {
          createDraftRef.current = {
            ...createDraftRef.current,
            values: nextValues,
            changed: true,
          };
        }

        return nextValues;
      });
    },
    [clearErrors, mode, useCurrentDateTime]
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

        const nextValues = {
          ...currentValues,
          eventAt,
        };

        if (mode === 'create') {
          createDraftRef.current = {
            ...createDraftRef.current,
            values: nextValues,
            changed: true,
          };
        }

        return nextValues;
      });
    },
    [clearErrors, mode, useCurrentDateTime]
  );

  const handleSubmit = useCallback(async (): Promise<string | null> => {
    if (
      submitInProgressRef.current ||
      isPhotoBusy ||
      (mode === 'edit' && entry === null)
    ) {
      return null;
    }

    const normalizedValues: CreateDiaryEntryData = {
      ...values,
      comment: values.comment.trim(),
      eventAt: useCurrentDateTime ? new Date() : new Date(values.eventAt),
    };

    const nextValidationError = validateValues(normalizedValues, hasPhoto);

    if (nextValidationError !== null) {
      clearErrors();
      setValidationError(nextValidationError);

      return null;
    }

    submitInProgressRef.current = true;
    setValidationError(null);

    try {
      let entryId: string;

      if (mode === 'create') {
        entryId = await createMutation.mutateAsync({
          ...normalizedValues,
          photoDraftUri,
        });
      } else {
        if (entry === null) {
          return null;
        }

        let photoChange: UpdateDiaryEntryPhotoChange = { type: 'keep' };

        if (photoAction === 'delete') {
          photoChange = { type: 'delete' };
        } else if (photoAction === 'replace' && photoDraftUri !== null) {
          photoChange = {
            type: 'replace',
            draftUri: photoDraftUri,
          };
        }

        entryId = await updateMutation.mutateAsync({
          ...normalizedValues,
          id: entry.id,
          photoChange,
        });
      }

      markPhotoSaved();

      if (mode === 'create') {
        resetCreateDraft();
      }

      onSaved(entryId);

      return entryId;
    } catch {
      return null;
    } finally {
      submitInProgressRef.current = false;
    }
  }, [
    clearErrors,
    createMutation,
    entry,
    hasPhoto,
    isPhotoBusy,
    markPhotoSaved,
    mode,
    onSaved,
    photoAction,
    photoDraftUri,
    resetCreateDraft,
    updateMutation,
    useCurrentDateTime,
    values,
  ]);

  const activeMutation = mode === 'create' ? createMutation : updateMutation;

  return {
    values,
    useCurrentDateTime,
    validationError,
    submissionError: activeMutation.error,
    isSubmitting: activeMutation.isPending,
    photoUri,
    photoError,
    hasTemporaryPhoto,
    isPhotoBusy,
    handleChoosePhoto,
    handleDeletePhoto,
    discardPhotoChanges,
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

export default useDiaryEntryForm;
