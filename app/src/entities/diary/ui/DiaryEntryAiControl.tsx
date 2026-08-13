import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { ToggleSwitch } from '@shared/ui';

type DiaryEntryAiControlProps = {
  value: boolean;
  disabled: boolean;

  onValueChange: (value: boolean) => void;
};

export const DiaryEntryAiControl = ({
  value,
  disabled,
  onValueChange,
}: DiaryEntryAiControlProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <ToggleSwitch
      icon="sparkles-outline"
      iconColor={
        disabled ? theme.colors.muted : theme.colors.metrics.longInsulin.text
      }
      label={t('diary.entry.aiAnalysis')}
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
    />
  );
};
