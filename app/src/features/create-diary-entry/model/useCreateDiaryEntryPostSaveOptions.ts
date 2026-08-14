import { useCallback, useEffect, useState } from 'react';

import { canCreateDiaryEntryTimer } from '@entities/diary';
import { PlatformOS } from '@shared/lib/platform';

type UseCreateDiaryEntryPostSaveOptionsParams = {
  visible: boolean;

  hasPhoto: boolean;
  isOnline: boolean;

  interactionDisabled: boolean;

  timerEventAt: Date;
};

export const useCreateDiaryEntryPostSaveOptions = ({
  visible,
  hasPhoto,
  isOnline,
  interactionDisabled,
  timerEventAt,
}: UseCreateDiaryEntryPostSaveOptionsParams) => {
  const [requestAi, setRequestAi] = useState(false);
  const [requestTimer, setRequestTimer] = useState(false);

  const canRequestAi = hasPhoto && isOnline && !interactionDisabled;

  const timerAvailable =
    PlatformOS.ANDROID && canCreateDiaryEntryTimer(timerEventAt);

  const canRequestTimer = timerAvailable && !interactionDisabled;

  useEffect(() => {
    if (visible) {
      return;
    }

    setRequestAi(false);
    setRequestTimer(false);
  }, [visible]);

  useEffect(() => {
    if (hasPhoto && isOnline) {
      return;
    }

    setRequestAi(false);
  }, [hasPhoto, isOnline]);

  useEffect(() => {
    if (timerAvailable) {
      return;
    }

    setRequestTimer(false);
  }, [timerAvailable]);

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

  const clearAiRequest = useCallback((): void => {
    setRequestAi(false);
  }, []);

  return {
    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

    handleRequestAiChange,
    handleRequestTimerChange,

    clearAiRequest,
  };
};
