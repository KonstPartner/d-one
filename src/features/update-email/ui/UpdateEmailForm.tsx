import { useTranslation } from 'react-i18next';

import { useUpdateEmail } from '../model/useUpdateEmail';
import * as s from '../styles/UpdateEmailForm';

export const UpdateEmailForm = () => {
  const { t } = useTranslation();

  const {
    isAuthenticated,

    mode,

    currentEmail,

    email,
    setEmail,

    pendingEmail,

    isDirty,
    isLoading,
    validationVisible,
    canConfirm,

    startEdit,
    cancel,
    sendVerification,
    confirmVerified,
  } = useUpdateEmail();

  if (!isAuthenticated) {
    return null;
  }

  const disableSend = isLoading || !isDirty;

  return (
    <s.Form>
      <s.Title>{t('auth.profile.email.title')}</s.Title>

      {mode === 'view' && (
        <>
          <s.Text>{currentEmail}</s.Text>

          <s.MutedText>{t('auth.profile.email.warningRelogin')}</s.MutedText>

          <s.PrimaryButton onPress={startEdit}>
            <s.PrimaryButtonText>
              {t('auth.profile.buttons.changeEmail')}
            </s.PrimaryButtonText>
          </s.PrimaryButton>
        </>
      )}

      {mode === 'edit' && (
        <>
          <s.EmailInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.profile.placeholders.enterNewEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            field="email"
            enableInvalidMessageText
            isActiveInvalidMessageText={validationVisible}
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={sendVerification}
          />

          <s.ActionsRow>
            <s.FlexiblePrimaryButton
              onPress={sendVerification}
              disabled={disableSend}
              onDisableSpinner
            >
              <s.PrimaryButtonText>
                {t('auth.profile.buttons.sendVerification')}
              </s.PrimaryButtonText>
            </s.FlexiblePrimaryButton>

            <s.FlexibleSecondaryButton
              onPress={cancel}
              disabled={isLoading}
              onDisableSpinner
            >
              <s.SecondaryButtonText>
                {t('auth.profile.buttons.cancel')}
              </s.SecondaryButtonText>
            </s.FlexibleSecondaryButton>
          </s.ActionsRow>
        </>
      )}

      {mode === 'sent' && (
        <>
          <s.MutedText>{t('auth.profile.email.sentTo')}</s.MutedText>

          <s.Text>{pendingEmail}</s.Text>

          <s.ActionsStack>
            <s.PrimaryButton
              onPress={confirmVerified}
              disabled={!canConfirm}
              onDisableSpinner
            >
              <s.PrimaryButtonText>
                {t('auth.profile.buttons.confirmDone')}
              </s.PrimaryButtonText>
            </s.PrimaryButton>

            <s.SecondaryButton
              onPress={cancel}
              disabled={isLoading}
              onDisableSpinner
            >
              <s.SecondaryButtonText>
                {t('auth.profile.buttons.cancel')}
              </s.SecondaryButtonText>
            </s.SecondaryButton>
          </s.ActionsStack>
        </>
      )}
    </s.Form>
  );
};
