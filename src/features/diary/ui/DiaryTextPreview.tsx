import { useState } from 'react';
import {
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  type TextLayoutEventData,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as globalStyles from '@features/shared/styles/global';

import * as styles from '../styles/DiaryTextPreview';

const PREVIEW_LINE_COUNT = 4;

type DiaryTextPreviewProps = {
  title: string;
  text: string;
  disabled?: boolean;
  onOpen: () => void;
};

type TextMeasurement = {
  text: string;
  lineCount: number;
};

const DiaryTextPreview = ({
  title,
  text,
  disabled = false,
  onOpen,
}: DiaryTextPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [measurement, setMeasurement] = useState<TextMeasurement>({
    text,
    lineCount: 0,
  });

  const isTruncated =
    measurement.text === text && measurement.lineCount > PREVIEW_LINE_COUNT;

  const handleTextLayout = ({
    nativeEvent,
  }: NativeSyntheticEvent<TextLayoutEventData>) => {
    const lineCount = nativeEvent.lines.length;

    setMeasurement((current) => {
      if (current.text === text && current.lineCount === lineCount) {
        return current;
      }

      return {
        text,
        lineCount,
      };
    });
  };

  const handleOpen = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <View style={styles.Section(theme)}>
      <Text style={globalStyles.Caption(theme)}>{title}</Text>

      <View style={styles.TextFrame}>
        <Text
          style={globalStyles.Body(theme)}
          numberOfLines={PREVIEW_LINE_COUNT}
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
