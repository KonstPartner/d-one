import { useTranslation } from 'react-i18next';

import { useChangePassword } from '../model/useChangePassword';
import * as s from '../styles/ChangePasswordForm';

export const ChangePasswordForm = () => {
  const { t } = useTranslation();

  const {
    currentPassword,
    setCurrentPassword,

    newPassword,
    setNewPassword,

    repeatedPassword,
    setRepeatedPassword,

    validationVisible,
    isPending,

    submit,
  } = useChangePassword();

  return (
    <s.Form>
      <s.Title>{t('auth.profile.changePasswordTitle')}</s.Title>

      <s.PasswordField
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder={t('auth.profile.placeholders.currentPassword')}
        field="password"
        editable={!isPending}
        returnKeyType="next"
      />

      <s.PasswordField
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t('auth.profile.placeholders.newPassword')}
        field="password"
        enableInvalidMessageText
        isActiveInvalidMessageText={validationVisible}
        editable={!isPending}
        returnKeyType="next"
      />

      <s.PasswordField
        value={repeatedPassword}
        onChangeText={setRepeatedPassword}
        placeholder={t('auth.profile.placeholders.confirmNewPassword')}
        editable={!isPending}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <s.SubmitButton onPress={submit} disabled={isPending} onDisableSpinner>
        <s.SubmitButtonText>
          {t('auth.profile.buttons.changePassword')}
        </s.SubmitButtonText>
      </s.SubmitButton>
    </s.Form>
  );
};
