import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogin } from '../model/useLogin';
import * as s from '../styles/LoginForm';

type LoginFormProps = {
  passwordAction?: ReactNode;
};

export const LoginForm = ({ passwordAction }: LoginFormProps) => {
  const { t } = useTranslation();

  const {
    email,
    setEmail,

    password,
    setPassword,

    isPending,

    submit,
  } = useLogin();

  return (
    <s.Form>
      <View>
        <s.TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.forms.placeholders.enterEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          field="email"
          withLabel
          labelPlaceholder={t('auth.forms.labels.email')}
          editable={!isPending}
          returnKeyType="next"
        />
      </View>

      <View>
        <s.PasswordField
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.forms.placeholders.enterPassword')}
          field="password"
          withLabel
          labelPlaceholder={t('auth.forms.labels.password')}
          editable={!isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      {passwordAction && <s.PasswordAction>{passwordAction}</s.PasswordAction>}

      <s.SubmitButton onPress={submit} loading={isPending}>
        <s.SubmitButtonText>{t('auth.forms.buttons.logIn')}</s.SubmitButtonText>
      </s.SubmitButton>
    </s.Form>
  );
};
