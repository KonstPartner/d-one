import { useTranslation } from 'react-i18next';
import type { PressableStateCallbackType } from 'react-native';

import { useDiaryTextPreview } from '../model/useDiaryTextPreview';
import * as s from '../styles/DiaryTextPreview';

type DiaryTextPreviewProps = {
  title: string;
  text: string;

  disabled?: boolean;

  onOpen: () => void;
};

export const DiaryTextPreview = ({
  title,
  text,

  disabled = false,

  onOpen,
}: DiaryTextPreviewProps) => {
  const { t } = useTranslation();

  const {
    previewLineCount,
    isTruncated,

    handleTextLayout,
    handleOpen,
  } = useDiaryTextPreview({
    text,
    onOpen,
  });

  return (
    <s.Section>
      <s.Title>{title}</s.Title>

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

      {isTruncated && (
        <s.MoreButton
          accessibilityRole="button"
          accessibilityLabel={t('diary.entry.openFullText', {
            title,
          })}
          accessibilityState={{
            disabled,
          }}
          disabled={disabled}
          hitSlop={8}
          onPress={handleOpen}
          style={({ pressed }: PressableStateCallbackType) => ({
            opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          })}
        >
          <s.MoreText>{t('diary.entry.more')}</s.MoreText>
        </s.MoreButton>
      )}
    </s.Section>
  );
};
