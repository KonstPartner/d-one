import { Text } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as gs from '@features/shared/styles/global';
import { PortalModal } from '@features/shared/ui';
import { Button, Input } from '@entities/shared/ui';

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
        <Text style={gs.Link(theme)}>
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
            style={gs.ButtonStyles(theme, isPending)}
            onPress={submit}
            loading={isPending}
          >
            <Text style={gs.TextWhite}>{t('common.send')}</Text>
          </Button>
        </s.Container>
      </PortalModal>
    </>
  );
};
