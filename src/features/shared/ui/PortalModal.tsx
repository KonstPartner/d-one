import { ReactNode, useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { Portal } from 'react-native-portalize';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvoidKeyboardView, Button } from '@entities/shared/ui';

import { PlatformOS } from '../model/constants/platformOS';
import * as globalStyles from '../styles/global/index';
import * as styles from '../styles/PortalModal';

const useAndroidBackToClose = (visible: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!PlatformOS.ANDROID || !visible) {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();

      return true;
    });

    return () => sub.remove();
  }, [visible, onClose]);
};

const PortalModal = ({
  visible,
  children,
  onClose,
  withoutScroll = false,
  withoutCloseBtn,
  isDisabled = false,
  withoutPadding = false,
}: {
  visible: boolean;
  children: ReactNode;
  onClose: () => void;
  withoutScroll?: boolean;
  withoutCloseBtn?: boolean;
  isDisabled?: boolean;
  withoutPadding?: boolean;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  useAndroidBackToClose(visible, onClose);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Pressable style={styles.Backdrop} onPress={onClose} />

      <View style={styles.Container}>
        <SafeAreaView style={styles.SafeArea} edges={['top', 'bottom']}>
          <View style={styles.Sheet(theme, withoutPadding)}>
            <AvoidKeyboardView>
              {withoutScroll ? (
                <View style={styles.Content}>{children}</View>
              ) : (
                <ScrollView
                  style={styles.Scroll}
                  contentContainerStyle={styles.ScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              )}

              {!withoutCloseBtn && (
                <Button
                  style={[
                    globalStyles.MutedButton(theme),
                    styles.CloseButton(theme, withoutPadding),
                  ]}
                  disabled={isDisabled}
                  onPress={onClose}
                  onDisableSpinner
                >
                  <Text style={globalStyles.TextWhite}>
                    {t('common.close')}
                  </Text>
                </Button>
              )}
            </AvoidKeyboardView>
          </View>
        </SafeAreaView>
      </View>
    </Portal>
  );
};

export default PortalModal;
