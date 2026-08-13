import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { DiaryEntry } from '@entities/diary';
import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';

import { useEditDiaryEntryDraftState } from './useEditDiaryEntryDraftState';
import { useEditDiaryEntryPhoto } from './useEditDiaryEntryPhoto';
import { useEditDiaryEntryPostSaveOptions } from './useEditDiaryEntryPostSaveOptions';
import { useEditDiaryEntrySubmit } from './useEditDiaryEntrySubmit';

export type { EditDiaryEntrySubmitResult } from './useEditDiaryEntrySubmit';

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

  const { isOnline } = useNetwork();

  const draft = useEditDiaryEntryDraftState({
    visible,
    entry,
  });

  const photo = useEditDiaryEntryPhoto({
    visible,
    entry,
  });

  const submit = useEditDiaryEntrySubmit({
    visible,
  });

  const timerEventAt =
    draft.values === null
      ? null
      : draft.useCurrentDateTime
        ? new Date()
        : draft.values.eventAt;

  const postSaveOptions = useEditDiaryEntryPostSaveOptions({
    visible,

    entry,

    hasPhoto: photo.hasPhoto,
    isOnline,

    interactionDisabled: disabled || submit.isSubmitting || photo.isPhotoBusy,

    timerEventAt,
  });

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
        disabled,

        entry,

        values: draft.values,
        useCurrentDateTime: draft.useCurrentDateTime,

        photoAction: photo.photoAction,
        photoDraftUri: photo.photoDraftUri,
        hasPhoto: photo.hasPhoto,
        isPhotoBusy: photo.isPhotoBusy,

        requestAi: postSaveOptions.requestAi,
        requestTimer: postSaveOptions.requestTimer,
        deleteAiAnalysis: postSaveOptions.deleteAiAnalysis,

        isOnline,

        onPhotoSaved: photo.markPhotoSaved,
      }),
    [
      disabled,
      draft.useCurrentDateTime,
      draft.values,
      entry,
      isOnline,
      photo.hasPhoto,
      photo.isPhotoBusy,
      photo.markPhotoSaved,
      photo.photoAction,
      photo.photoDraftUri,
      postSaveOptions.deleteAiAnalysis,
      postSaveOptions.requestAi,
      postSaveOptions.requestTimer,
      submit.submit,
    ]
  );

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    aiAnalysis: postSaveOptions.aiAnalysis,

    requestAi: postSaveOptions.requestAi,
    canRequestAi: postSaveOptions.canRequestAi,

    requestTimer: postSaveOptions.requestTimer,
    canRequestTimer: postSaveOptions.canRequestTimer,

    deleteAiAnalysis: postSaveOptions.deleteAiAnalysis,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

    hasPhotoChanges: photo.hasPhotoChanges,

    hasAiChanges: postSaveOptions.hasAiChanges,

    isPhotoBusy: photo.isPhotoBusy,

    isSubmitting: submit.isSubmitting,

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

    handleDeleteAiAnalysis: postSaveOptions.handleDeleteAiAnalysis,

    selectPhoto: photo.selectPhoto,

    deletePhoto: handleDeletePhoto,

    discardPhotoChanges: photo.discardPhotoChanges,

    handleSubmit,
  };
};
