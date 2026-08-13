import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  canCreateDiaryEntryTimer,
  type DiaryEntry,
  type DiaryEntryEditableValues,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';
import { PlatformOS } from '@shared/lib/platform';

import {
  type EditDiaryEntryPhotoChange,
  useEditDiaryEntryMutation,
} from '../api/useEditDiaryEntryMutation';

import { useEditDiaryEntryDraftState } from './useEditDiaryEntryDraftState';
import { useEditDiaryEntryPhoto } from './useEditDiaryEntryPhoto';

type UseEditDiaryEntryFormParams = {
  visible: boolean;

  entry: DiaryEntry | null;

  disabled?: boolean;
};

export type EditDiaryEntrySubmitResult = {
  entryId: string;

  entryUpdated: boolean;

  requestAi: boolean;
  requestTimer: boolean;

  deleteAiAnalysis: boolean;
};

const hasEditableChanges = ({
  entry,
  values,
}: {
  entry: DiaryEntry;
  values: DiaryEntryEditableValues;
}): boolean =>
  values.glucose !== entry.glucose ||
  values.mealRelation !== entry.mealRelation ||
  values.shortInsulin !== entry.shortInsulin ||
  values.longInsulin !== entry.longInsulin ||
  values.carbsGram !== entry.carbsGram ||
  values.comment !== entry.comment ||
  values.eventAt.getTime() !== entry.eventAt.getTime();

export const useEditDiaryEntryForm = ({
  visible,
  entry,
  disabled = false,
}: UseEditDiaryEntryFormParams) => {
  const { t } = useTranslation();

  const { isOnline } = useNetwork();

  const mutation = useEditDiaryEntryMutation();

  const draft = useEditDiaryEntryDraftState({
    visible,
    entry,
  });

  const photo = useEditDiaryEntryPhoto({
    visible,
    entry,
  });

  const submitInProgressRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestAi, setRequestAi] = useState(false);
  const [requestTimer, setRequestTimer] = useState(false);

  const [deleteAiAnalysis, setDeleteAiAnalysis] = useState(false);

  const timerEventAt =
    draft.values === null
      ? null
      : draft.useCurrentDateTime
        ? new Date()
        : draft.values.eventAt;

  const timerAvailable =
    PlatformOS.ANDROID &&
    timerEventAt !== null &&
    canCreateDiaryEntryTimer(timerEventAt);

  const canRequestTimer =
    timerAvailable && !disabled && !isSubmitting && !photo.isPhotoBusy;

  useEffect(() => {
    if (!visible) {
      submitInProgressRef.current = false;

      setIsSubmitting(false);

      setRequestAi(false);
      setRequestTimer(false);

      setDeleteAiAnalysis(false);

      return;
    }

    setRequestAi(false);
    setRequestTimer(false);

    setDeleteAiAnalysis(false);
  }, [entry?.id, visible]);

  useEffect(() => {
    if (photo.hasPhoto && isOnline) {
      return;
    }

    setRequestAi(false);
  }, [isOnline, photo.hasPhoto]);

  useEffect(() => {
    if (timerAvailable) {
      return;
    }

    setRequestTimer(false);
  }, [timerAvailable]);

  useEffect(() => {
    if (photo.photoError === null) {
      return;
    }

    showNotification('error', t(`diary.form.photo.errors.${photo.photoError}`));

    photo.clearPhotoError();
  }, [photo.clearPhotoError, photo.photoError, t]);

  const canRequestAi =
    photo.hasPhoto &&
    isOnline &&
    !disabled &&
    !isSubmitting &&
    !photo.isPhotoBusy;

  const aiAnalysis =
    deleteAiAnalysis || !entry?.aiAnalysis ? null : entry.aiAnalysis;

  const handleRequestAiChange = useCallback(
    (value: boolean) => {
      if (!value) {
        setRequestAi(false);

        return;
      }

      if (!canRequestAi) {
        return;
      }

      setDeleteAiAnalysis(false);

      setRequestAi(true);
    },
    [canRequestAi]
  );

  const handleRequestTimerChange = useCallback(
    (value: boolean) => {
      if (value && !canRequestTimer) {
        return;
      }

      setRequestTimer(value);
    },
    [canRequestTimer]
  );

  const handleDeleteAiAnalysis = useCallback(() => {
    if (disabled || isSubmitting || entry === null || !entry.aiAnalysis) {
      return;
    }

    setRequestAi(false);

    setDeleteAiAnalysis(true);
  }, [disabled, entry, isSubmitting]);

  const handleDeletePhoto = useCallback(() => {
    photo.deletePhoto();

    setRequestAi(false);
  }, [photo.deletePhoto]);

  const handleSubmit =
    useCallback(async (): Promise<EditDiaryEntrySubmitResult | null> => {
      const currentValues = draft.values;

      if (
        disabled ||
        submitInProgressRef.current ||
        photo.isPhotoBusy ||
        entry === null ||
        currentValues === null
      ) {
        return null;
      }

      const eventAt = draft.useCurrentDateTime
        ? new Date()
        : currentValues.eventAt;

      const normalizedValues = normalizeDiaryEntryEditableValues({
        ...currentValues,

        eventAt,
      });

      const validationError = validateDiaryEntryEditableValues({
        values: normalizedValues,

        hasPhoto: photo.hasPhoto,
      });

      if (validationError !== null) {
        mutation.reset();

        showNotification('error', t(`diary.form.errors.${validationError}`));

        return null;
      }

      let photoChange: EditDiaryEntryPhotoChange = {
        type: 'keep',
      };

      if (photo.photoAction === 'delete') {
        photoChange = {
          type: 'delete',
        };
      } else if (
        photo.photoAction === 'replace' &&
        photo.photoDraftUri !== null
      ) {
        photoChange = {
          type: 'replace',

          draftUri: photo.photoDraftUri,
        };
      }

      const entryHasEditableChanges = hasEditableChanges({
        entry,
        values: normalizedValues,
      });

      const entryUpdated =
        entryHasEditableChanges || photo.photoAction !== 'keep';

      const shouldRequestAi =
        requestAi && photo.hasPhoto && isOnline && !disabled;

      const shouldRequestTimer =
        requestTimer &&
        PlatformOS.ANDROID &&
        canCreateDiaryEntryTimer(normalizedValues.eventAt);

      submitInProgressRef.current = true;

      setIsSubmitting(true);

      try {
        if (entryUpdated) {
          await mutation.mutateAsync({
            ...normalizedValues,

            id: entry.id,

            photoChange,
          });

          photo.markPhotoSaved();
        }

        return {
          entryId: entry.id,

          entryUpdated,

          requestAi: shouldRequestAi,
          requestTimer: shouldRequestTimer,

          deleteAiAnalysis,
        };
      } catch (error) {
        console.error('Failed to update diary entry', error);

        submitInProgressRef.current = false;

        setIsSubmitting(false);

        showNotification('error', t('diary.form.errors.updateFailed'));

        return null;
      }
    }, [
      deleteAiAnalysis,
      disabled,
      draft,
      entry,
      isOnline,
      mutation,
      photo,
      requestAi,
      requestTimer,
      t,
    ]);

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    aiAnalysis,

    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

    deleteAiAnalysis,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

    hasPhotoChanges: photo.hasPhotoChanges,

    hasAiChanges: requestAi || deleteAiAnalysis,

    isPhotoBusy: photo.isPhotoBusy,

    isSubmitting,

    handleGlucoseChange: draft.handleGlucoseChange,

    handleCarbsGramChange: draft.handleCarbsGramChange,

    handleShortInsulinChange: draft.handleShortInsulinChange,

    handleLongInsulinChange: draft.handleLongInsulinChange,

    handleMealRelationChange: draft.handleMealRelationChange,

    handleCommentChange: draft.handleCommentChange,

    handleCurrentDateTimeChange: draft.handleCurrentDateTimeChange,

    handleEventDateChange: draft.handleEventDateChange,

    handleEventTimeChange: draft.handleEventTimeChange,

    handleRequestAiChange,
    handleRequestTimerChange,

    handleDeleteAiAnalysis,

    selectPhoto: photo.selectPhoto,

    deletePhoto: handleDeletePhoto,

    discardPhotoChanges: photo.discardPhotoChanges,

    handleSubmit,
  };
};
