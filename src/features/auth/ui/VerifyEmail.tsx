import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';

import { Button } from '@entities/shared/ui';

import { useAuth } from '../model/context/AuthContext';
import useVerifyEmailButtons from '../model/hooks/useVerifyEmailButtons';
import * as styles from '../styles/VerifyEmail';

const VerifyEmail = () => {
  const theme = useTheme();
  const { authUser } = useAuth();

  const { isSentMessage, isPressed, sendEmailMessage, checkVerifiedEmail, t } =
    useVerifyEmailButtons();

  if (!authUser) {
    return null;
  }

  return (
    <View style={styles.Container(theme)}>
      <Text style={styles.Title(theme)}>{t('auth.verifyEmail.title')}</Text>

      <Text style={styles.Description(theme)}>
        {isSentMessage
          ? t('auth.verifyEmail.sentDescription')
          : t('auth.verifyEmail.description')}
      </Text>

      <Text style={styles.EmailText(theme)}>{authUser.email}</Text>

      {isSentMessage ? (
        <Button
          style={styles.PrimaryButton(theme, isPressed)}
          onPress={checkVerifiedEmail}
          disabled={isPressed}
          onDisableSpinner
        >
          <Text style={styles.PrimaryButtonText(theme)}>
            {t('auth.verifyEmail.buttons.check')}
          </Text>
        </Button>
      ) : (
        <Button
          style={styles.PrimaryButton(theme, isPressed)}
          onPress={sendEmailMessage}
          disabled={isPressed}
          onDisableSpinner
        >
          <Text style={styles.PrimaryButtonText(theme)}>
            {t('auth.verifyEmail.buttons.send')}
          </Text>
        </Button>
      )}
    </View>
  );
};

export default VerifyEmail;
