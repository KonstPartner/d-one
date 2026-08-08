import { Text } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as sharedStyles from '@shared/styles';
import { Button, Input, PortalModal } from '@shared/ui';

import { useResetPassword } from '../model/useResetPassword';
import * as s from '../styles/ResetPassword';

export const ResetPasswordModal = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    visible,
    email,
    validationVisible,
    isPending,
    open,
    close,
    changeEmail,
    submit,
  } = useResetPassword();

  return (
    <>
      <s.Trigger onPress={open} accessibilityRole="button">
        <Text style={sharedStyles.Text(theme, 'base', 'medium', 'primary')}>
          {t('auth.forms.links.forgotPassword')}
        </Text>
      </s.Trigger>

      <PortalModal
        visible={visible}
        onClose={close}
        isDisabled={isPending}
        withoutScroll
      >
        <s.Container>
          <s.Head>
            <s.Title>{t('auth.forgotPassword.title')}</s.Title>

            <s.Description>
              {t('auth.forgotPassword.description')}
            </s.Description>
          </s.Head>

          <Input
            value={email}
            onChangeText={changeEmail}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            field="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            withLabel
            labelPlaceholder={t('auth.forgotPassword.emailLabel')}
            enableInvalidMessageText
            isActiveInvalidMessageText={validationVisible}
            editable={!isPending}
            returnKeyType="send"
            onSubmitEditing={submit}
          />

          <Button
            style={sharedStyles.FullWidth}
            onPress={submit}
            loading={isPending}
          >
            <Text
              style={sharedStyles.Text(theme, 'base', 'regular', 'inverse')}
            >
              {t('common.send')}
            </Text>
          </Button>
        </s.Container>
      </PortalModal>
    </>
  );
};
