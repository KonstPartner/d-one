import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { appIcon } from '@entities/shared/constants';

import useAuthForm from '../../model/hooks/useAuthForm';
import { GoogleRegisterPrefill } from '../../model/types/googleAuth';
import * as styles from '../../styles/forms/AuthForm';

import LogInForm from './LogIn';
import SignUpForm from './SignUp';

const AuthForms = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    chosenForm,
    setChosenForm,
    handleLogin,
    handleRegister,
    isLoginPending,
    isRegisterPending,
  } = useAuthForm();

  const [registerPrefill, setRegisterPrefill] =
    useState<GoogleRegisterPrefill | null>(null);

  const openEmptySignUpForm = () => {
    setRegisterPrefill(null);
    setChosenForm('sign-up');
  };

  const openGoogleSignUpForm = (prefill: GoogleRegisterPrefill) => {
    setRegisterPrefill(prefill);
    setChosenForm('sign-up');
  };

  const openLogInForm = () => {
    setRegisterPrefill(null);
    setChosenForm('log-in');
  };

  const isSignUp = chosenForm === 'sign-up';

  return (
    <View style={styles.AuthContent(theme)}>
      <View style={styles.Brand(theme)}>
        <Image source={appIcon} style={styles.Logo} resizeMode="cover" />

        <Text style={styles.BrandName(theme)}>{t('auth.brand')}</Text>
      </View>

      <Text style={styles.ScreenTitle(theme)}>
        {isSignUp ? t('auth.forms.signUpTitle') : t('auth.forms.signInTitle')}
      </Text>

      {isSignUp ? (
        <SignUpForm
          onSubmit={handleRegister}
          isSending={isRegisterPending}
          onSignInPress={openLogInForm}
          prefill={registerPrefill}
        />
      ) : (
        <LogInForm
          onSubmit={handleLogin}
          isSending={isLoginPending}
          onSignUpPress={openEmptySignUpForm}
          onGoogleRegister={openGoogleSignUpForm}
        />
      )}
    </View>
  );
};

export default AuthForms;
