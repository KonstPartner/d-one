import { type ReactNode, useEffect } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-portalize';

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

type KeyboardAwareContentProps = {
  children: ReactNode;
};

const KeyboardAwareContent = ({ children }: KeyboardAwareContentProps) => {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const useAndroidBackToClose = (visible: boolean, onClose: () => void): void => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) {
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
          <s.Sheet style={s.getSheetStyle(theme, withoutPadding)}>
            <KeyboardAwareContent>
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
            </KeyboardAwareContent>
          </s.Sheet>
        </s.SafeArea>
      </s.Container>
    </Portal>
  );
};
