import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GoogleSignInButton } from '@features/auth/google-sign-in';
import { LoginForm } from '@features/auth/login';
import { RegisterForm } from '@features/auth/register';
import { ResetPasswordModal } from '@features/auth/reset-password';
import appIcon from '@assets/images/splash-icon.png';

import { useAuthFormState } from '../model/useAuthFormState';
import * as s from '../styles/AuthForm';

export const AuthForm = () => {
  const { t } = useTranslation();

  const {
    isRegister,
    registerPrefill,

    openLogin,
    openEmptyRegister,
    openPrefilledRegister,
  } = useAuthFormState();

  return (
    <s.Root>
      <s.Brand>
        <s.Logo source={appIcon} resizeMode="cover" />

        <s.BrandName>{t('auth.brand')}</s.BrandName>
      </s.Brand>

      <s.ScreenTitle>
        {isRegister ? t('auth.forms.signUpTitle') : t('auth.forms.signInTitle')}
      </s.ScreenTitle>

      {isRegister ? (
        <RegisterForm
          prefill={registerPrefill}
          footer={
            <s.SwitchRow>
              <s.SwitchText>{t('auth.forms.links.haveAccount')}</s.SwitchText>

              <Pressable accessibilityRole="button" onPress={openLogin}>
                <s.SwitchLink>{t('auth.forms.links.logIn')}</s.SwitchLink>
              </Pressable>
            </s.SwitchRow>
          }
        />
      ) : (
        <s.LoginContent>
          <LoginForm passwordAction={<ResetPasswordModal />} />

          <s.Divider>
            <s.DividerLine />

            <s.DividerText>{t('auth.forms.or')}</s.DividerText>

            <s.DividerLine />
          </s.Divider>

          <GoogleSignInButton onRegister={openPrefilledRegister} />

          <s.SwitchRow>
            <s.SwitchText>{t('auth.forms.links.noAccount')}</s.SwitchText>

            <Pressable accessibilityRole="button" onPress={openEmptyRegister}>
              <s.SwitchLink>{t('auth.forms.links.signUp')}</s.SwitchLink>
            </Pressable>
          </s.SwitchRow>
        </s.LoginContent>
      )}
    </s.Root>
  );
};
