import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

import { useCreateDiaryEntryDraftState } from './useCreateDiaryEntryDraftState';
import { useCreateDiaryEntryPhoto } from './useCreateDiaryEntryPhoto';
import { useCreateDiaryEntryPostSaveOptions } from './useCreateDiaryEntryPostSaveOptions';
import { useCreateDiaryEntrySubmit } from './useCreateDiaryEntrySubmit';

export type { CreateDiaryEntrySubmitResult } from './useCreateDiaryEntrySubmit';

type UseCreateDiaryEntryFormParams = {
  visible: boolean;
};

export const useCreateDiaryEntryForm = ({
  visible,
}: UseCreateDiaryEntryFormParams) => {
  const { t } = useTranslation();

  const { isOnline } = useNetwork();

  const draft = useCreateDiaryEntryDraftState({
    visible,
  });

  const photo = useCreateDiaryEntryPhoto({
    visible,
  });

  const submit = useCreateDiaryEntrySubmit({
    visible,
  });

  const timerEventAt = draft.useCurrentDateTime
    ? new Date()
    : draft.values.eventAt;

  const postSaveOptions = useCreateDiaryEntryPostSaveOptions({
    visible,

    hasPhoto: photo.hasPhoto,
    isOnline,

    interactionDisabled: submit.isSubmitting || photo.isPhotoBusy,

    timerEventAt,
  });

  useEffect(() => {
    if (visible) {
      return;
    }

    draft.resetDraft();
  }, [draft.resetDraft, visible]);

  useEffect(() => {
    if (photo.photoError === null) {
      return;
    }

    showNotification('error', t(`diary.form.photo.errors.${photo.photoError}`));

    photo.clearPhotoError();
  }, [photo.clearPhotoError, photo.photoError, t]);

  const handleDeletePhoto = useCallback((): void => {
    postSaveOptions.clearAiRequest();

    photo.deletePhoto();
  }, [photo.deletePhoto, postSaveOptions.clearAiRequest]);

  const handleSubmit = useCallback(
    () =>
      submit.submit({
        values: draft.values,
        useCurrentDateTime: draft.useCurrentDateTime,

        photoDraftUri: photo.photoDraftUri,
        hasPhoto: photo.hasPhoto,
        isPhotoBusy: photo.isPhotoBusy,

        requestAi: postSaveOptions.requestAi,
        requestTimer: postSaveOptions.requestTimer,

        isOnline,

        onPhotoSaved: photo.markPhotoSaved,
      }),
    [
      draft.useCurrentDateTime,
      draft.values,
      isOnline,
      photo.hasPhoto,
      photo.isPhotoBusy,
      photo.markPhotoSaved,
      photo.photoDraftUri,
      postSaveOptions.requestAi,
      postSaveOptions.requestTimer,
      submit.submit,
    ]
  );

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,
    photoEditorSource: photo.photoEditorSource,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

    isPhotoBusy: photo.isPhotoBusy,

    isSubmitting: submit.isSubmitting,

    requestAi: postSaveOptions.requestAi,
    canRequestAi: postSaveOptions.canRequestAi,

    requestTimer: postSaveOptions.requestTimer,
    canRequestTimer: postSaveOptions.canRequestTimer,

    handleGlucoseChange: draft.handleGlucoseChange,

    handleCarbsGramChange: draft.handleCarbsGramChange,

    handleShortInsulinChange: draft.handleShortInsulinChange,

    handleLongInsulinChange: draft.handleLongInsulinChange,

    handleMealRelationChange: draft.handleMealRelationChange,

    handleCommentChange: draft.handleCommentChange,

    handleCurrentDateTimeChange: draft.handleCurrentDateTimeChange,

    handleEventDateChange: draft.handleEventDateChange,

    handleEventTimeChange: draft.handleEventTimeChange,

    handleRequestAiChange: postSaveOptions.handleRequestAiChange,
    handleRequestTimerChange: postSaveOptions.handleRequestTimerChange,

    selectPhoto: photo.selectPhoto,

    deletePhoto: handleDeletePhoto,

    cancelPhotoEditing: photo.cancelPhotoEditing,
    confirmPhotoEditing: photo.confirmPhotoEditing,
    handlePhotoEditorError: photo.handlePhotoEditorError,

    discardPhoto: photo.discardPhoto,

    handleSubmit,
  };
};
