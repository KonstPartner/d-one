import { Text, View } from 'react-native';

import { Button, PasswordInput } from '@entities/shared/ui';
import * as globalStyles from '@features/shared/styles/global';

import useChangePasswordForm from '../api/hooks/useChangePasswordForm';

const ChangePasswordForm = () => {
  const {
    theme,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    repeatedPassword,
    setRepeatedPassword,
    isPressed,
    isActiveInvalidMessageText,
    handleChangePassword,
    t,
  } = useChangePasswordForm();

  return (
    <View style={globalStyles.StackContainer(theme, 'sm')}>
      <Text style={globalStyles.Title(theme)}>
        {t('auth.profile.changePasswordTitle')}
      </Text>

      <PasswordInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder={t('auth.profile.placeholders.currentPassword')}
        field="password"
        editable={!isPressed}
      />

      <PasswordInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder={t('auth.profile.placeholders.newPassword')}
        enableInvalidMessageText
        field="password"
        isActiveInvalidMessageText={isActiveInvalidMessageText}
        editable={!isPressed}
      />

      <PasswordInput
        value={repeatedPassword}
        onChangeText={setRepeatedPassword}
        placeholder={t('auth.profile.placeholders.confirmNewPassword')}
        editable={!isPressed}
        returnKeyType="done"
        onSubmitEditing={handleChangePassword}
      />

      <Button
        style={globalStyles.Button(theme, 'primary', isPressed)}
        onPress={handleChangePassword}
        disabled={isPressed}
        onDisableSpinner
      >
        <Text style={globalStyles.ButtonText(theme)}>
          {t('auth.profile.buttons.changePassword')}
        </Text>
      </Button>
    </View>
  );
};

export default ChangePasswordForm;
