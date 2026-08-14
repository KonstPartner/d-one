import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { DiaryEntry } from './diaryEntry';

type UseDiaryEntryCardParams = {
  entry: DiaryEntry;
  synchronizing: boolean;

  onPress?: (entry: DiaryEntry) => void;

  onOpenPhoto?: (entry: DiaryEntry) => void;
};

export const useDiaryEntryCard = ({
  entry,
  synchronizing,
  onPress,
  onOpenPhoto,
}: UseDiaryEntryCardParams) => {
  const { t } = useTranslation();

  const editAccessibilityLabel = t('diary.entry.editAccessibilityLabel');

  const pendingDelete = entry.syncStatus === 'pendingDelete';

  const actionsDisabled = pendingDelete || synchronizing;

  const hasPhoto = entry.localPhotoUri !== null || entry.photoUrl !== null;

  const photoInteractive =
    hasPhoto && onOpenPhoto !== undefined && !actionsDisabled;

  const handleCardPress = useCallback(() => {
    if (!actionsDisabled) {
      onPress?.(entry);
    }
  }, [actionsDisabled, entry, onPress]);

  const handlePhotoPress = useCallback(() => {
    if (photoInteractive) {
      onOpenPhoto?.(entry);
    }
  }, [entry, onOpenPhoto, photoInteractive]);

  return {
    editAccessibilityLabel,

    pendingDelete,
    actionsDisabled,

    photoInteractive,

    handleCardPress,
    handlePhotoPress,
  };
};
