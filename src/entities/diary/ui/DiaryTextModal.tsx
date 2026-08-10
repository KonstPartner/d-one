import { Modal } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { PressableStateCallbackType } from 'react-native';

import * as s from '../styles/DiaryTextModal';

type DiaryTextModalProps = {
  visible: boolean;

  title: string;
  text: string;

  onClose: () => void;
};

const pressedStyle = ({ pressed }: PressableStateCallbackType) => ({
  opacity: pressed ? 0.7 : 1,
});

export const DiaryTextModal = ({
  visible,

  title,
  text,

  onClose,
}: DiaryTextModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <s.Root>
        <s.Backdrop accessible={false} onPress={onClose} />

        <s.Sheet
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          edges={['bottom']}
        >
          <s.Header>
            <s.Title numberOfLines={1}>{title}</s.Title>

            <s.HeaderCloseButton
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              onPress={onClose}
              style={pressedStyle}
            >
              <Ionicons
                name="close"
                size={theme.size.md}
                color={theme.colors.text}
              />
            </s.HeaderCloseButton>
          </s.Header>

          <s.Body showsVerticalScrollIndicator>
            <s.BodyContent>
              <s.BodyText selectable>{text}</s.BodyText>
            </s.BodyContent>
          </s.Body>

          <s.Footer>
            <s.FooterButton
              tone="primary"
              variant="solid"
              size="lg"
              onPress={onClose}
            >
              <s.FooterButtonText>{t('common.close')}</s.FooterButtonText>
            </s.FooterButton>
          </s.Footer>
        </s.Sheet>
      </s.Root>
    </Modal>
  );
};
