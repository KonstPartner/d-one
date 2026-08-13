import { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { dateKit } from '@shared/lib/date';

import type { DiaryEntry } from './diaryEntry';

type UseDiaryEntryCardParams = {
  entry: DiaryEntry;
  synchronizing: boolean;

  onPress?: (entry: DiaryEntry) => void;

  onOpenPhoto?: (entry: DiaryEntry) => void;
};

export type DiaryMetricKey =
  | 'glucose'
  | 'carbsGram'
  | 'shortInsulin'
  | 'longInsulin';

export type DiaryMetric = {
  key: DiaryMetricKey;
  label: string;
  value: string;
};

type DiaryTextKey = 'comment' | 'aiAnalysis';

type SyncIconName =
  | 'cloud-done-outline'
  | 'cloud-offline-outline'
  | 'trash-outline';

export const useDiaryEntryCard = ({
  entry,
  synchronizing,
  onPress,
  onOpenPhoto,
}: UseDiaryEntryCardParams) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const [openedTextKey, setOpenedTextKey] = useState<DiaryTextKey | null>(null);

  const locale = i18n.resolvedLanguage ?? i18n.language;

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const dateTimeLabel = useMemo(
    () => dateKit.relativeDateTimeLabel(entry.eventAt),
    [entry.eventAt, locale]
  );

  const metrics = useMemo<DiaryMetric[]>(() => {
    const result: DiaryMetric[] = [];

    if (entry.glucose !== null) {
      result.push({
        key: 'glucose',

        label: t('diary.entry.metrics.glucose'),

        value: numberFormatter.format(entry.glucose),
      });
    }

    if (entry.carbsGram !== null) {
      result.push({
        key: 'carbsGram',

        label: t('diary.entry.metrics.carbohydrates'),

        value: numberFormatter.format(entry.carbsGram),
      });
    }

    if (entry.shortInsulin !== null) {
      result.push({
        key: 'shortInsulin',

        label: t('diary.entry.metrics.shortInsulin'),

        value: numberFormatter.format(entry.shortInsulin),
      });
    }

    if (entry.longInsulin !== null) {
      result.push({
        key: 'longInsulin',

        label: t('diary.entry.metrics.longInsulin'),

        value: numberFormatter.format(entry.longInsulin),
      });
    }

    return result;
  }, [
    entry.carbsGram,
    entry.glucose,
    entry.longInsulin,
    entry.shortInsulin,
    numberFormatter,
    t,
  ]);

  const comment = entry.comment.trim();

  const aiAnalysis = entry.aiAnalysis.trim();

  const commentTitle = t('diary.entry.comment');

  const aiAnalysisTitle = t('diary.entry.aiAnalysis');

  const editAccessibilityLabel = t('diary.entry.editAccessibilityLabel');

  const pendingDelete = entry.syncStatus === 'pendingDelete';

  const actionsDisabled = pendingDelete || synchronizing;

  const hasPhoto = entry.localPhotoUri !== null || entry.photoUrl !== null;

  const cardInteractive = onPress !== undefined && !actionsDisabled;

  const photoInteractive =
    hasPhoto && onOpenPhoto !== undefined && !actionsDisabled;

  const mealRelationLabel =
    entry.mealRelation === null
      ? null
      : t(`diary.entry.mealRelation.${entry.mealRelation}`);

  const openedTextTitle =
    openedTextKey === 'comment'
      ? commentTitle
      : openedTextKey === 'aiAnalysis'
        ? aiAnalysisTitle
        : '';

  const openedTextValue =
    openedTextKey === 'comment'
      ? comment
      : openedTextKey === 'aiAnalysis'
        ? aiAnalysis
        : '';

  let syncIcon: SyncIconName = 'cloud-done-outline';

  let syncLabel = t('diary.entry.sync.synced');

  let syncColor = theme.colors.success;

  if (pendingDelete) {
    syncIcon = 'trash-outline';

    syncLabel = t('diary.entry.sync.deleting');

    syncColor = theme.colors.muted;
  } else if (synchronizing) {
    syncLabel = t('diary.entry.sync.synchronizing');

    syncColor = theme.colors.primary;
  } else if (entry.syncStatus !== 'synced') {
    syncIcon = 'cloud-offline-outline';

    syncLabel = t('diary.entry.sync.pending');

    syncColor = theme.colors.warning;
  }

  const handleCardPress = useCallback(() => {
    if (cardInteractive) {
      onPress?.(entry);
    }
  }, [cardInteractive, entry, onPress]);

  const handlePhotoPress = useCallback(() => {
    if (photoInteractive) {
      onOpenPhoto?.(entry);
    }
  }, [entry, onOpenPhoto, photoInteractive]);

  const handleOpenComment = useCallback(() => {
    if (!actionsDisabled) {
      setOpenedTextKey('comment');
    }
  }, [actionsDisabled]);

  const handleOpenAiAnalysis = useCallback(() => {
    if (!actionsDisabled) {
      setOpenedTextKey('aiAnalysis');
    }
  }, [actionsDisabled]);

  const handleCloseText = useCallback(() => {
    setOpenedTextKey(null);
  }, []);

  return {
    dateTimeLabel,
    metrics,

    comment,
    commentTitle,

    aiAnalysis,
    aiAnalysisTitle,

    editAccessibilityLabel,
    mealRelationLabel,

    pendingDelete,
    actionsDisabled,

    cardInteractive,
    photoInteractive,

    openedText: {
      visible: openedTextKey !== null,

      title: openedTextTitle,

      value: openedTextValue,
    },

    syncStatus: {
      loading: synchronizing && !pendingDelete,

      icon: syncIcon,

      label: syncLabel,

      color: syncColor,
    },

    handleCardPress,
    handlePhotoPress,

    handleOpenComment,
    handleOpenAiAnalysis,
    handleCloseText,
  };
};
