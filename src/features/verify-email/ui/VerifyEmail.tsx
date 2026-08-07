import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as gs from '@features/shared/styles/global';
import { Button } from '@entities/shared/ui';

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
    <s.Container>
      <s.Title>{t('auth.verifyEmail.title')}</s.Title>

      <s.Description>
        {verificationEmailSent
          ? t('auth.verifyEmail.sentDescription')
          : t('auth.verifyEmail.description')}
      </s.Description>

      <s.Email>{email}</s.Email>

      <Button
        style={gs.ButtonStyles(theme, isPending)}
        onPress={verificationEmailSent ? check : send}
        disabled={isPending}
        onDisableSpinner
      >
        <s.ButtonText>
          {verificationEmailSent
            ? t('auth.verifyEmail.buttons.check')
            : t('auth.verifyEmail.buttons.send')}
        </s.ButtonText>
      </Button>
    </s.Container>
  );
};
