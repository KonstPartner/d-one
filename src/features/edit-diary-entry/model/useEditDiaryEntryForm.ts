import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntry,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
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

export const useEditDiaryEntryForm = ({
  visible,
  entry,
  disabled = false,
}: UseEditDiaryEntryFormParams) => {
  const { t } = useTranslation();

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

  useEffect(() => {
    if (visible) {
      return;
    }

    submitInProgressRef.current = false;

    setIsSubmitting(false);
  }, [visible]);

  useEffect(() => {
    if (photo.photoError === null) {
      return;
    }

    showNotification('error', t(`diary.form.photo.errors.${photo.photoError}`));

    photo.clearPhotoError();
  }, [photo.clearPhotoError, photo.photoError, t]);

  const handleSubmit = useCallback(async (): Promise<string | null> => {
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

    submitInProgressRef.current = true;

    setIsSubmitting(true);

    try {
      const entryId = await mutation.mutateAsync({
        ...normalizedValues,

        id: entry.id,

        photoChange,
      });

      photo.markPhotoSaved();

      return entryId;
    } catch (error) {
      console.error('Failed to update diary entry', error);

      submitInProgressRef.current = false;

      setIsSubmitting(false);

      showNotification('error', t('diary.form.errors.updateFailed'));

      return null;
    }
  }, [disabled, draft, entry, mutation, photo, t]);

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

    hasPhotoChanges: photo.hasPhotoChanges,

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

    discardPhotoChanges: photo.discardPhotoChanges,

    handleSubmit,
  };
};
