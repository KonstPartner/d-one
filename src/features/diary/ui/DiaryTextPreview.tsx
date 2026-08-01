import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as globalStyles from '@features/shared/styles/global';

import useDiaryTextPreview from '../model/hooks/useDiaryTextPreview';
import * as styles from '../styles/DiaryTextPreview';

type DiaryTextPreviewProps = {
  title: string;
  text: string;
  disabled?: boolean;
  onOpen: () => void;
};

const DiaryTextPreview = ({
  title,
  text,
  disabled = false,
  onOpen,
}: DiaryTextPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { previewLineCount, isTruncated, handleTextLayout, handleOpen } =
    useDiaryTextPreview({
      text,
      onOpen,
    });

  return (
    <View style={styles.Section(theme)}>
      <Text style={globalStyles.Caption(theme)}>{title}</Text>

      <View style={styles.TextFrame}>
        <Text
          style={globalStyles.Body(theme)}
          numberOfLines={previewLineCount}
          ellipsizeMode="tail"
        >
          {text}
        </Text>

        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={styles.Measurement}
        >
          <Text
            style={globalStyles.Body(theme)}
            onTextLayout={handleTextLayout}
          >
            {text}
          </Text>
        </View>
      </View>

      {isTruncated && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diary.entry.openFullText', {
            title,
          })}
          accessibilityState={{ disabled }}
          disabled={disabled}
          hitSlop={8}
          onPress={handleOpen}
          style={({ pressed }) => [
            styles.MoreButton(theme),
            disabled && styles.Disabled,
            pressed && !disabled && styles.Pressed,
          ]}
        >
          <Text style={globalStyles.Text(theme, 'sm', 'bold', 'primary')}>
            {t('diary.entry.more')}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default DiaryTextPreview;
