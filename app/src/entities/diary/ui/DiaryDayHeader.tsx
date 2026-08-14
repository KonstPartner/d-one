import { memo } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';

import type { DiaryDayKey } from '../model/diaryDay';
import * as s from '../styles/DiaryDayHeader';

type DiaryDayHeaderProps = {
  dayKey: DiaryDayKey;

  title: string;
  entriesCount: number;

  collapsed: boolean;

  disabled?: boolean;

  onToggle: (dayKey: DiaryDayKey) => void;
};

const DiaryDayHeaderComponent = ({
  dayKey,

  title,
  entriesCount,

  collapsed,

  disabled = false,

  onToggle,
}: DiaryDayHeaderProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const entriesLabel = t('diary.list.day.entries', {
    count: entriesCount,
  });

  return (
    <s.Root
      style={[ss.Surface(theme, 'card'), ss.Rounded(theme, 'md')]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${entriesLabel}`}
      accessibilityState={{
        expanded: !collapsed,

        disabled,
      }}
      disabled={disabled}
      onPress={() => {
        onToggle(dayKey);
      }}
    >
      <s.Main>
        <Ionicons
          name={collapsed ? 'chevron-forward' : 'chevron-down'}
          size={theme.size.md}
          color={disabled ? theme.colors.muted : theme.colors.text}
        />

        <s.Title numberOfLines={1}>{title}</s.Title>
      </s.Main>

      <s.Count>{entriesLabel}</s.Count>
    </s.Root>
  );
};

export const DiaryDayHeader = memo(DiaryDayHeaderComponent);
