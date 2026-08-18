import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  canCreateDiaryEntryTimer,
  type DiaryEntry,
  type DiaryEntryEditableValues,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';
import { PlatformOS } from '@shared/lib/platform';

import {
  type EditDiaryEntryPhotoChange,
  useEditDiaryEntryMutation,
} from '../api/useEditDiaryEntryMutation';

type UseEditDiaryEntrySubmitParams = {
  visible: boolean;
};

type SubmitEditDiaryEntryParams = {
  disabled: boolean;

  entry: DiaryEntry | null;

  values: DiaryEntryEditableValues | null;
  useCurrentDateTime: boolean;

  photoAction: 'keep' | 'replace' | 'delete';
  photoDraftUri: string | null;
  hasPhoto: boolean;
  isPhotoBusy: boolean;

  requestAi: boolean;
  requestTimer: boolean;
  deleteAiAnalysis: boolean;

  isOnline: boolean;

  onPhotoSaved: () => void;
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
  values.ultraShortInsulin !== entry.ultraShortInsulin ||
  values.longInsulin !== entry.longInsulin ||
  values.carbsGram !== entry.carbsGram ||
  values.comment !== entry.comment ||
  values.eventAt.getTime() !== entry.eventAt.getTime();

const getPhotoChange = ({
  photoAction,
  photoDraftUri,
}: {
  photoAction: 'keep' | 'replace' | 'delete';
  photoDraftUri: string | null;
}): EditDiaryEntryPhotoChange => {
  if (photoAction === 'delete') {
    return {
      type: 'delete',
    };
  }

  if (photoAction === 'replace' && photoDraftUri !== null) {
    return {
      type: 'replace',
      draftUri: photoDraftUri,
    };
  }

  return {
    type: 'keep',
  };
};

export const useEditDiaryEntrySubmit = ({
  visible,
}: UseEditDiaryEntrySubmitParams) => {
  const { t } = useTranslation();

  const mutation = useEditDiaryEntryMutation();

  const submitInProgressRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      return;
    }

    submitInProgressRef.current = false;

    setIsSubmitting(false);
  }, [visible]);

  const submit = useCallback(
    async ({
      disabled,

      entry,

      values,
      useCurrentDateTime,

      photoAction,
      photoDraftUri,
      hasPhoto,
      isPhotoBusy,

      requestAi,
      requestTimer,
      deleteAiAnalysis,

      isOnline,

      onPhotoSaved,
    }: SubmitEditDiaryEntryParams): Promise<EditDiaryEntrySubmitResult | null> => {
      if (
        disabled ||
        submitInProgressRef.current ||
        isPhotoBusy ||
        entry === null ||
        values === null
      ) {
        return null;
      }

      const eventAt = useCurrentDateTime ? new Date() : values.eventAt;

      const normalizedValues = normalizeDiaryEntryEditableValues({
        ...values,
        eventAt,
      });

      const validationError = validateDiaryEntryEditableValues({
        values: normalizedValues,
        hasPhoto,
      });

      if (validationError !== null) {
        mutation.reset();

        showNotification('error', t(`diary.form.errors.${validationError}`));

        return null;
      }

      const photoChange = getPhotoChange({
        photoAction,
        photoDraftUri,
      });

      const entryUpdated =
        hasEditableChanges({
          entry,
          values: normalizedValues,
        }) || photoAction !== 'keep';

      const shouldRequestAi = requestAi && hasPhoto && isOnline && !disabled;

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

          onPhotoSaved();
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
    },
    [mutation, t]
  );

  return {
    isSubmitting,
    submit,
  };
};
