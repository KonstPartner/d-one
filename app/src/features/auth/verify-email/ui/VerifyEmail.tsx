import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

import { useVerifyEmail } from '../model/useVerifyEmail';
import * as s from '../styles/VerifyEmail';

export const VerifyEmail = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { email, verificationEmailSent, isPending, send, check } =
    useVerifyEmail();

  if (!email) {
    return null;
  }

  return (
    <View style={[ss.FullWidth, ss.Stack(theme, 'xl'), ss.InsetY(theme, 'xl')]}>
      <s.Title style={ss.Text(theme, 'xl', 'bold', 'default', '2xl')}>
        {t('auth.verifyEmail.title')}
      </s.Title>

      <s.Description style={ss.Text(theme, 'base', 'regular', 'muted', 'md')}>
        {verificationEmailSent
          ? t('auth.verifyEmail.sentDescription')
          : t('auth.verifyEmail.description')}
      </s.Description>

      <s.Email style={ss.Text(theme, 'base', 'bold', 'default', 'md')}>
        {email}
      </s.Email>

      <Button
        style={ss.FullWidth}
        onPress={verificationEmailSent ? check : send}
        loading={isPending}
      >
        <s.ButtonText style={ss.Text(theme, 'md', 'bold', 'inverse', 'md')}>
          {verificationEmailSent
            ? t('auth.verifyEmail.buttons.check')
            : t('auth.verifyEmail.buttons.send')}
        </s.ButtonText>
      </Button>
    </View>
  );
};
