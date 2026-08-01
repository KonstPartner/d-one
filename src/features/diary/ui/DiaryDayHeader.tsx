import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as globalStyles from '@features/shared/styles/global';

import type { DiaryDayKey } from '../model';

type DiaryDayHeaderProps = {
  dayKey: DiaryDayKey;
  title: string;
  entriesCount: number;
  collapsed: boolean;
  onToggle: (dayKey: DiaryDayKey) => void;
};

const DiaryDayHeader = ({
  dayKey,
  title,
  entriesCount,
  collapsed,
  onToggle,
}: DiaryDayHeaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const entriesLabel = t('diary.list.day.entries', {
    count: entriesCount,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${entriesLabel}`}
      accessibilityState={{ expanded: !collapsed }}
      onPress={() => onToggle(dayKey)}
      style={({ pressed }) => [
        globalStyles.Surface(theme, 'card'),
        globalStyles.Rounded(theme, 'md'),
        globalStyles.Inset(theme, 'md'),
        globalStyles.Row(theme, 'center', 'space-between', 'sm'),
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={[
          globalStyles.Row(theme, 'center', 'flex-start', 'sm'),
          globalStyles.FlexItem,
        ]}
      >
        <Ionicons
          name={collapsed ? 'chevron-forward' : 'chevron-down'}
          size={theme.size.md}
          color={theme.colors.text}
        />

        <View style={globalStyles.FlexItem}>
          <Text style={globalStyles.Subheading(theme)} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <Text style={globalStyles.Caption(theme)}>{entriesLabel}</Text>
    </Pressable>
  );
};

export default DiaryDayHeader;
