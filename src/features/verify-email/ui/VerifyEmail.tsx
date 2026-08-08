import { useTranslation } from 'react-i18next';

import { useVerifyEmail } from '../model/useVerifyEmail';
import * as s from '../styles/VerifyEmail';

export const VerifyEmail = () => {
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

      <s.SubmitButton
        onPress={verificationEmailSent ? check : send}
        loading={isPending}
      >
        <s.ButtonText>
          {verificationEmailSent
            ? t('auth.verifyEmail.buttons.check')
            : t('auth.verifyEmail.buttons.send')}
        </s.ButtonText>
      </s.SubmitButton>
    </s.Container>
  );
};
