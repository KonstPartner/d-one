import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';

import { Button, Input } from '@entities/shared/ui';
import * as globalStyles from '@features/shared/styles/global';

import useAuthData from '../api/hooks/useAuthData';
import useUpdateUserEmail from '../api/hooks/useUpdateUserEmail';

const UpdateUserEmail = () => {
  const theme = useTheme();
  const { authData } = useAuthData();

  const {
    mode,
    currentEmail,
    email,
    setEmail,
    pendingEmail,
    isLoading,
    isDirty,
    startEdit,
    cancel,
    sendVerification,
    confirmVerified,
    isActiveInvalidMessageText,
    canConfirm,
    t,
  } = useUpdateUserEmail(authData?.email);

  if (!authData) {
    return null;
  }

  const disableSend = isLoading || !isDirty;

  return (
    <View style={globalStyles.StackContainer(theme, 'sm')}>
      <Text style={globalStyles.Title(theme)}>
        {t('auth.profile.email.title')}
      </Text>

      {mode === 'view' && (
        <>
          <Text style={globalStyles.TextStyle(theme)}>{currentEmail}</Text>

          <Text style={globalStyles.MutedText(theme)}>
            {t('auth.profile.email.warningRelogin')}
          </Text>

          <Button
            style={globalStyles.Button(theme)}
            onPress={startEdit}
            onDisableSpinner
          >
            <Text style={globalStyles.ButtonText(theme)}>
              {t('auth.profile.buttons.changeEmail')}
            </Text>
          </Button>
        </>
      )}

      {mode === 'edit' && (
        <>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.profile.placeholders.enterNewEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            field="email"
            enableInvalidMessageText
            isActiveInvalidMessageText={isActiveInvalidMessageText}
          />

          <View style={globalStyles.ActionsRow(theme, 'sm')}>
            <Button
              style={[
                globalStyles.Button(theme, 'primary', disableSend),
                globalStyles.FlexItem,
              ]}
              onPress={sendVerification}
              disabled={disableSend}
            >
              <Text style={globalStyles.ButtonText(theme)}>
                {t('auth.profile.buttons.sendVerification')}
              </Text>
            </Button>

            <Button
              style={[
                globalStyles.Button(theme, 'secondary', isLoading),
                globalStyles.FlexItem,
              ]}
              onPress={cancel}
              disabled={isLoading}
              onDisableSpinner
            >
              <Text style={globalStyles.ButtonText(theme, 'secondary')}>
                {t('auth.profile.buttons.cancel')}
              </Text>
            </Button>
          </View>
        </>
      )}

      {mode === 'sent' && (
        <>
          <Text style={globalStyles.MutedText(theme)}>
            {t('auth.profile.email.sentTo')}
          </Text>

          <Text style={globalStyles.TextStyle(theme)}>{pendingEmail}</Text>

          <View style={globalStyles.StackContainer(theme, 'sm')}>
            <Button
              style={globalStyles.Button(
                theme,
                'primary',
                !canConfirm || isLoading
              )}
              onPress={confirmVerified}
              disabled={!canConfirm || isLoading}
              onDisableSpinner
            >
              <Text style={globalStyles.ButtonText(theme)}>
                {t('auth.profile.buttons.confirmDone')}
              </Text>
            </Button>

            <Button
              style={globalStyles.Button(theme, 'secondary', isLoading)}
              onPress={cancel}
              disabled={isLoading}
              onDisableSpinner
            >
              <Text style={globalStyles.ButtonText(theme, 'secondary')}>
                {t('auth.profile.buttons.cancel')}
              </Text>
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

export default UpdateUserEmail;
