import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { Button, PasswordInput } from '@shared/ui';

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
    <s.Form style={ss.FullWidth}>
      <s.Title>{t('auth.profile.changePasswordTitle')}</s.Title>

      <PasswordInput
        style={ss.FullWidth}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder={t('auth.profile.placeholders.currentPassword')}
        field="password"
        editable={!isPending}
        returnKeyType="next"
      />

      <PasswordInput
        style={ss.FullWidth}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t('auth.profile.placeholders.newPassword')}
        field="password"
        enableInvalidMessageText
        isActiveInvalidMessageText={validationVisible}
        editable={!isPending}
        returnKeyType="next"
      />

      <PasswordInput
        value={repeatedPassword}
        onChangeText={setRepeatedPassword}
        placeholder={t('auth.profile.placeholders.confirmNewPassword')}
        editable={!isPending}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <Button style={ss.FullWidth} onPress={submit} loading={isPending}>
        <s.SubmitButtonText>
          {t('auth.profile.buttons.changePassword')}
        </s.SubmitButtonText>
      </Button>
    </s.Form>
  );
};
