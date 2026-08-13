import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryEntry,
  getDiaryEntryTimerDurationSeconds,
} from '@entities/diary';
import { showNotification } from '@shared/lib/notifications';
import { startSystemTimer } from '@shared/lib/system-timer';

export const useOwnerDiaryTimer = () => {
  const { t } = useTranslation();

  const setTimerForEntry = useCallback(
    async (entry: DiaryEntry): Promise<void> => {
      const durationSeconds = getDiaryEntryTimerDurationSeconds(entry.eventAt);

      if (durationSeconds <= 0) {
        showNotification('error', t('diary.form.timer.errors.expired'));

        return;
      }

      try {
        await startSystemTimer({
          durationSeconds,
          message: t('diary.form.timer.systemLabel'),
        });

        showNotification('success', t('diary.form.timer.enabled'));
      } catch (error) {
        console.error(`Failed to create diary timer: ${entry.id}`, error);

        showNotification('error', t('diary.form.timer.errors.createFailed'));
      }
    },
    [t]
  );

  return {
    setTimerForEntry,
  };
};
