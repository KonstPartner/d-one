import { useCallback, useEffect, useState } from 'react';

import { canCreateDiaryEntryTimer, type DiaryEntry } from '@entities/diary';
import { PlatformOS } from '@shared/lib/platform';

type UseEditDiaryEntryPostSaveOptionsParams = {
  visible: boolean;

  entry: DiaryEntry | null;

  hasPhoto: boolean;
  isOnline: boolean;

  interactionDisabled: boolean;

  timerEventAt: Date | null;
};

export const useEditDiaryEntryPostSaveOptions = ({
  visible,

  entry,

  hasPhoto,
  isOnline,

  interactionDisabled,

  timerEventAt,
}: UseEditDiaryEntryPostSaveOptionsParams) => {
  const [requestAi, setRequestAi] = useState(false);
  const [requestTimer, setRequestTimer] = useState(false);

  const [deleteAiAnalysis, setDeleteAiAnalysis] = useState(false);

  const canRequestAi = hasPhoto && isOnline && !interactionDisabled;

  const timerAvailable =
    PlatformOS.ANDROID &&
    timerEventAt !== null &&
    canCreateDiaryEntryTimer(timerEventAt);

  const canRequestTimer = timerAvailable && !interactionDisabled;

  useEffect(() => {
    setRequestAi(false);
    setRequestTimer(false);
    setDeleteAiAnalysis(false);
  }, [entry?.id, visible]);

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

  const handleRequestTimerChange = useCallback(
    (value: boolean): void => {
      if (value && !canRequestTimer) {
        return;
      }

      setRequestTimer(value);
    },
    [canRequestTimer]
  );

  const handleDeleteAiAnalysis = useCallback((): void => {
    if (interactionDisabled || entry === null || !entry.aiAnalysis) {
      return;
    }

    setRequestAi(false);
    setDeleteAiAnalysis(true);
  }, [entry, interactionDisabled]);

  const clearAiRequest = useCallback((): void => {
    setRequestAi(false);
  }, []);

  const aiAnalysis =
    deleteAiAnalysis || !entry?.aiAnalysis ? null : entry.aiAnalysis;

  return {
    aiAnalysis,

    requestAi,
    canRequestAi,

    requestTimer,
    canRequestTimer,

    deleteAiAnalysis,

    hasAiChanges: requestAi || deleteAiAnalysis,

    handleRequestAiChange,
    handleRequestTimerChange,

    handleDeleteAiAnalysis,

    clearAiRequest,
  };
};
