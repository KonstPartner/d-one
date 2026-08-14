import { type ReactNode, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-portalize';

import { PlatformOS } from '@shared/lib/platform';
import * as ss from '@shared/styles';

import { KeyboardAvoidingContent } from './KeyboardAvoidingContent';
import * as s from './styles/PortalModal';

type PortalModalProps = {
  visible: boolean;
  children: ReactNode;
  onClose: () => void;

  withoutScroll?: boolean;
  withoutCloseBtn?: boolean;
  isDisabled?: boolean;
  withoutPadding?: boolean;
};

const useAndroidBackToClose = (visible: boolean, onClose: () => void): void => {
  useEffect(() => {
    if (!PlatformOS.ANDROID || !visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();

        return true;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [visible, onClose]);
};

export const PortalModal = ({
  visible,
  children,
  onClose,
  withoutScroll = false,
  withoutCloseBtn = false,
  isDisabled = false,
  withoutPadding = false,
}: PortalModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  useAndroidBackToClose(visible, onClose);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <s.Backdrop onPress={onClose} />

      <s.Container>
        <s.SafeArea edges={['top', 'bottom']}>
          <s.Sheet
            style={[s.getSheetStyle(theme, withoutPadding), ss.FullWidth]}
          >
            <KeyboardAvoidingContent>
              {withoutScroll ? (
                <s.Content>{children}</s.Content>
              ) : (
                <s.Scroll
                  contentContainerStyle={s.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </s.Scroll>
              )}

              {!withoutCloseBtn && (
                <s.CloseButton
                  style={s.getCloseButtonStyle(theme, withoutPadding)}
                  loading={isDisabled}
                  onPress={onClose}
                >
                  <s.CloseButtonText>{t('common.close')}</s.CloseButtonText>
                </s.CloseButton>
              )}
            </KeyboardAvoidingContent>
          </s.Sheet>
        </s.SafeArea>
      </s.Container>
    </Portal>
  );
};
