import { ActivityIndicator } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { DiarySyncStatus } from '../model/diaryEntry';
import * as s from '../styles/DiaryEntryCard';

type DiaryEntrySyncStatusProps = {
  syncStatus: DiarySyncStatus;
  synchronizing: boolean;
};

type SyncIconName =
  | 'cloud-done-outline'
  | 'cloud-offline-outline'
  | 'trash-outline';

export const DiaryEntrySyncStatus = ({
  syncStatus,
  synchronizing,
}: DiaryEntrySyncStatusProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const pendingDelete = syncStatus === 'pendingDelete';

  let icon: SyncIconName = 'cloud-done-outline';
  let label = t('diary.entry.sync.synced');
  let color = theme.colors.success;

  if (pendingDelete) {
    icon = 'trash-outline';
    label = t('diary.entry.sync.deleting');
    color = theme.colors.muted;
  } else if (synchronizing) {
    label = t('diary.entry.sync.synchronizing');
    color = theme.colors.primary;
  } else if (syncStatus !== 'synced') {
    icon = 'cloud-offline-outline';
    label = t('diary.entry.sync.pending');
    color = theme.colors.warning;
  }

  return (
    <s.Status accessible accessibilityLabel={label}>
      {synchronizing && !pendingDelete ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={theme.size.md} color={color} />
      )}
    </s.Status>
  );
};
