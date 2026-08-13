import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntry,
  type DiaryEntryEditableValues,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

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

  const [deleteAiAnalysis, setDeleteAiAnalysis] = useState(false);

  useEffect(() => {
    if (!visible) {
      submitInProgressRef.current = false;

      setIsSubmitting(false);

      setRequestAi(false);

      setDeleteAiAnalysis(false);

      return;
    }

    setRequestAi(false);

    setDeleteAiAnalysis(false);
  }, [entry?.id, visible]);

  useEffect(() => {
    if (photo.hasPhoto && isOnline) {
      return;
    }

    setRequestAi(false);
  }, [isOnline, photo.hasPhoto]);

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
      t,
    ]);

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    aiAnalysis,

    requestAi,
    canRequestAi,

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

    handleDeleteAiAnalysis,

    selectPhoto: photo.selectPhoto,

    deletePhoto: handleDeletePhoto,

    discardPhotoChanges: photo.discardPhotoChanges,

    handleSubmit,
  };
};
