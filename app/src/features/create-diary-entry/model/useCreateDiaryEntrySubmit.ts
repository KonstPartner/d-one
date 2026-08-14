import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  canCreateDiaryEntryTimer,
  type DiaryEntryEditableValues,
  normalizeDiaryEntryEditableValues,
  validateDiaryEntryEditableValues,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';
import { PlatformOS } from '@shared/lib/platform';

import { useCreateDiaryEntryMutation } from '../api/useCreateDiaryEntryMutation';

type UseCreateDiaryEntrySubmitParams = {
  visible: boolean;
};

type SubmitCreateDiaryEntryParams = {
  values: DiaryEntryEditableValues;
  useCurrentDateTime: boolean;

  photoDraftUri: string | null;
  hasPhoto: boolean;
  isPhotoBusy: boolean;

  requestAi: boolean;
  requestTimer: boolean;

  isOnline: boolean;

  onPhotoSaved: () => void;
};

export type CreateDiaryEntrySubmitResult = {
  entryId: string;

  requestAi: boolean;
  requestTimer: boolean;
};

export const useCreateDiaryEntrySubmit = ({
  visible,
}: UseCreateDiaryEntrySubmitParams) => {
  const { t } = useTranslation();

  const mutation = useCreateDiaryEntryMutation();

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
      values,
      useCurrentDateTime,

      photoDraftUri,
      hasPhoto,
      isPhotoBusy,

      requestAi,
      requestTimer,

      isOnline,

      onPhotoSaved,
    }: SubmitCreateDiaryEntryParams): Promise<CreateDiaryEntrySubmitResult | null> => {
      if (submitInProgressRef.current || isPhotoBusy) {
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

      submitInProgressRef.current = true;

      setIsSubmitting(true);

      try {
        const entryId = await mutation.mutateAsync({
          ...normalizedValues,
          photoDraftUri,
        });

        onPhotoSaved();

        return {
          entryId,

          requestAi: requestAi && hasPhoto && isOnline,

          requestTimer:
            requestTimer &&
            PlatformOS.ANDROID &&
            canCreateDiaryEntryTimer(normalizedValues.eventAt),
        };
      } catch (error) {
        console.error('Failed to create diary entry', error);

        submitInProgressRef.current = false;

        setIsSubmitting(false);

        showNotification('error', t('diary.form.errors.creationFailed'));

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
