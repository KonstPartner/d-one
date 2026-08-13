import { Switch } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryEntryAiControl';

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
    <s.Root $disabled={disabled}>
      <s.Icon>
        <Ionicons
          name="sparkles-outline"
          size={theme.size.md}
          color={disabled ? theme.colors.muted : theme.colors.text}
        />
      </s.Icon>

      <s.Title numberOfLines={1}>{t('diaryAi.title')}</s.Title>

      <Switch
        value={value}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={t('diaryAi.title')}
        onValueChange={onValueChange}
      />
    </s.Root>
  );
};
