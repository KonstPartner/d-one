import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button, Input } from '@entities/shared/ui';
import { requestPasswordReset } from '@features/auth/api/firebase';
import * as styles from '@features/auth/styles/ResetPassword';
import { errorMapper, validateInput } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';
import { PortalModal, showNotification } from '@features/shared/ui';

const ResetPasswordModal = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isActiveInvalidMessageText, setIsActiveInvalidMessageText] =
    useState(false);

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    if (isLoading) {
      return;
    }

    setVisible(false);
    setEmail('');
    setIsActiveInvalidMessageText(false);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (isActiveInvalidMessageText) {
      setIsActiveInvalidMessageText(false);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }

    setIsActiveInvalidMessageText(true);

    if (!validateInput('email', email)) {
      return;
    }

    try {
      setIsLoading(true);

      await requestPasswordReset(email);

      showNotification('success', t('auth.forgotPassword.successText'));

      setVisible(false);
      setEmail('');
      setIsActiveInvalidMessageText(false);
    } catch (error) {
      showNotification('error', errorMapper(error, 'firebase'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Pressable
        style={styles.Trigger}
        onPress={openModal}
        accessibilityRole="button"
      >
        <Text style={globalStyles.Link(theme)}>
          {t('auth.forms.links.forgotPassword')}
        </Text>
      </Pressable>

      <PortalModal
        visible={visible}
        onClose={closeModal}
        isDisabled={isLoading}
        withoutScroll
      >
        <View style={styles.Container(theme)}>
          <View style={styles.Head}>
            <Text style={styles.Title(theme)}>
              {t('auth.forgotPassword.title')}
            </Text>

            <Text style={styles.Description(theme)}>
              {t('auth.forgotPassword.description')}
            </Text>
          </View>

          <Input
            value={email}
            onChangeText={handleEmailChange}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            field="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            withLabel
            labelPlaceholder={t('auth.forgotPassword.emailLabel')}
            enableInvalidMessageText
            isActiveInvalidMessageText={isActiveInvalidMessageText}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />

          <Button
            style={globalStyles.ButtonStyles(theme, isLoading)}
            onPress={handleSubmit}
            disabled={isLoading}
            onDisableSpinner
          >
            <Text style={globalStyles.TextWhite}>{t('common.send')}</Text>
          </Button>
        </View>
      </PortalModal>
    </>
  );
};

export default ResetPasswordModal;
