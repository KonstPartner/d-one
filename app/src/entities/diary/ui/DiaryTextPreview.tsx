import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type {
  GestureResponderEvent,
  PressableStateCallbackType,
} from 'react-native';

import { useDiaryTextPreview } from '../model/useDiaryTextPreview';
import * as s from '../styles/DiaryTextPreview';

export type DiaryTextPreviewVariant = 'comment' | 'aiAnalysis';

type DiaryTextPreviewProps = {
  variant: DiaryTextPreviewVariant;

  title: string;
  text: string;

  disabled?: boolean;

  onOpen: () => void;
};

const variantIcons = {
  comment: 'chatbubble-ellipses-outline',
  aiAnalysis: 'sparkles-outline',
} as const;

export const DiaryTextPreview = ({
  variant,

  title,
  text,

  disabled = false,

  onOpen,
}: DiaryTextPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { previewLineCount, isTruncated, handleTextLayout, handleOpen } =
    useDiaryTextPreview({
      onOpen,
    });

  const interactive = isTruncated && !disabled;

  const iconColor =
    variant === 'aiAnalysis'
      ? theme.colors.metrics.longInsulin.text
      : theme.colors.primary;

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (interactive) {
      handleOpen();
    }
  };

  return (
    <s.Root
      $variant={variant}
      disabled={!interactive}
      pointerEvents={interactive ? 'auto' : 'none'}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={
        interactive
          ? t('diary.entry.openFullText', {
              title,
            })
          : undefined
      }
      onPress={interactive ? handlePress : undefined}
      style={({ pressed }: PressableStateCallbackType) => ({
        opacity: interactive && pressed ? 0.72 : 1,
      })}
    >
      <s.Icon $variant={variant}>
        <Ionicons
          name={variantIcons[variant]}
          size={theme.size.lg}
          color={iconColor}
        />
      </s.Icon>

      <s.Content>
        <s.Title numberOfLines={1}>{title}</s.Title>

        <s.TextFrame>
          <s.PreviewText numberOfLines={previewLineCount} ellipsizeMode="tail">
            {text}
          </s.PreviewText>

          <s.Measurement
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            <s.MeasurementText onTextLayout={handleTextLayout}>
              {text}
            </s.MeasurementText>
          </s.Measurement>
        </s.TextFrame>
      </s.Content>

      {isTruncated && (
        <Ionicons
          name="chevron-forward"
          size={theme.size.md}
          color={theme.colors.muted}
        />
      )}
    </s.Root>
  );
};
