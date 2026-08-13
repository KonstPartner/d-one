import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  canCreateDiaryEntryTimer,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { useNetwork } from '@shared/lib/network';
import { showNotification } from '@shared/lib/notifications';
import { PlatformOS } from '@shared/lib/platform';

import { useCreateDiaryEntryMutation } from '../api/useCreateDiaryEntryMutation';

import { useCreateDiaryEntryDraftState } from './useCreateDiaryEntryDraftState';
import { useCreateDiaryEntryPhoto } from './useCreateDiaryEntryPhoto';

type UseCreateDiaryEntryFormParams = {
  visible: boolean;
};

export type CreateDiaryEntrySubmitResult = {
  entryId: string;

  requestAi: boolean;
  requestTimer: boolean;
};

export const useCreateDiaryEntryForm = ({
  visible,
}: UseCreateDiaryEntryFormParams) => {
  const { t } = useTranslation();

  const { isOnline } = useNetwork();

  const mutation = useCreateDiaryEntryMutation();

  const draft = useCreateDiaryEntryDraftState({
    visible,
  });

  const photo = useCreateDiaryEntryPhoto({
    visible,
  });

  const submitInProgressRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestAi, setRequestAi] = useState(false);
  const [requestTimer, setRequestTimer] = useState(false);

  const timerEventAt = draft.useCurrentDateTime
    ? new Date()
    : draft.values.eventAt;

  const canRequestAi =
    photo.hasPhoto && isOnline && !isSubmitting && !photo.isPhotoBusy;

  const timerAvailable =
    PlatformOS.ANDROID && canCreateDiaryEntryTimer(timerEventAt);

  const canRequestTimer = timerAvailable && !isSubmitting && !photo.isPhotoBusy;

  useEffect(() => {
    if (visible) {
      setRequestAi(false);
      setRequestTimer(false);

      return;
    }

    submitInProgressRef.current = false;

    setIsSubmitting(false);
    setRequestAi(false);
    setRequestTimer(false);
  }, [visible]);

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

  const handleRequestAiChange = useCallback(
    (value: boolean): void => {
      if (value && !canRequestAi) {
        return;
      }

      setRequestAi(value);
    },
    [canRequestAi]
  );

  const handleRequestTimerChange = useCallback(
    (value: boolean): void => {
      if (value && !canRequestTimer) {
        return;
      }

      setRequestTimer(value);
    },
    [canRequestTimer]
  );

  const handleDeletePhoto = useCallback((): void => {
    setRequestAi(false);

    photo.deletePhoto();
  }, [photo.deletePhoto]);

  const handleSubmit =
    useCallback(async (): Promise<CreateDiaryEntrySubmitResult | null> => {
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

        const result: CreateDiaryEntrySubmitResult = {
          entryId,

          requestAi: requestAi && photo.hasPhoto && isOnline,
          requestTimer:
            requestTimer &&
            PlatformOS.ANDROID &&
            canCreateDiaryEntryTimer(normalizedValues.eventAt),
        };

        photo.markPhotoSaved();

        draft.resetDraft();

        setRequestAi(false);
        setRequestTimer(false);

        return result;
      } catch (error) {
        console.error('Failed to create diary entry', error);

        submitInProgressRef.current = false;

        setIsSubmitting(false);

        showNotification('error', t('diary.form.errors.creationFailed'));

        return null;
      }
    }, [draft, isOnline, mutation, photo, requestAi, requestTimer, t]);

  return {
    values: draft.values,

    useCurrentDateTime: draft.useCurrentDateTime,

    photoUri: photo.photoUri,

    hasTemporaryPhoto: photo.hasTemporaryPhoto,

    isPhotoBusy: photo.isPhotoBusy,

    isSubmitting,

    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

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

    selectPhoto: photo.selectPhoto,

    deletePhoto: handleDeletePhoto,

    discardPhoto: photo.discardPhoto,

    handleSubmit,
  };
};
