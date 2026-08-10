import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';

import { useCreateDiaryEntryMutation } from '../api/useCreateDiaryEntryMutation';

import { useCreateDiaryEntryDraftState } from './useCreateDiaryEntryDraftState';
import { useCreateDiaryEntryPhoto } from './useCreateDiaryEntryPhoto';

type UseCreateDiaryEntryFormParams = {
  visible: boolean;
};

export const useCreateDiaryEntryForm = ({
  visible,
}: UseCreateDiaryEntryFormParams) => {
  const { t } = useTranslation();

  const mutation = useCreateDiaryEntryMutation();

  const draft = useCreateDiaryEntryDraftState({
    visible,
  });

  const photo = useCreateDiaryEntryPhoto({
    visible,
  });

  const submitInProgressRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (photo.photoError === null) {
      return;
    }

    showNotification('error', t(`diary.form.photo.errors.${photo.photoError}`));

    photo.clearPhotoError();
  }, [photo.clearPhotoError, photo.photoError, t]);

  const handleSubmit = useCallback(async (): Promise<string | null> => {
    if (submitInProgressRef.current || photo.isPhotoBusy) {
      return null;
    }

    const eventAt = draft.useCurrentDateTime
      ? new Date()
      : draft.values.eventAt;

    const normalizedValues = normalizeDiaryEntryEditableValues({
      ...draft.values,
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

    submitInProgressRef.current = true;

    setIsSubmitting(true);

    try {
      const entryId = await mutation.mutateAsync({
        ...normalizedValues,

        photoDraftUri: photo.photoDraftUri,
      });

      photo.markPhotoSaved();

      draft.resetDraft();

      return entryId;
    } catch (error) {
      console.error('Failed to create diary entry', error);

      showNotification('error', t('diary.form.errors.creationFailed'));

      return null;
    } finally {
      submitInProgressRef.current = false;

      setIsSubmitting(false);
    }
  }, [draft, mutation, photo, t]);

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

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

    selectPhoto: photo.selectPhoto,

    deletePhoto: photo.deletePhoto,

    discardPhoto: photo.discardPhoto,

    handleSubmit,
  };
};
