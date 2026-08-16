import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { type RegisterPrefill, useRegister } from '../model/useRegister';
import * as s from '../styles/RegisterForm';

type RegisterFormProps = {
  prefill?: RegisterPrefill | null;
  footer?: ReactNode;
};

export const RegisterForm = ({ prefill, footer }: RegisterFormProps) => {
  const { t } = useTranslation();

  const {
    nickname,
    setNickname,

    email,
    setEmail,

    password,
    setPassword,

    repeatedPassword,
    setRepeatedPassword,

    validationVisible,
    isPending,

    submit,
  } = useRegister({
    prefill,
  });

  return (
    <s.Form>
      <View>
        <s.TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder={t('auth.forms.placeholders.enterNickname')}
          field="nickname"
          enableInvalidMessageText
          isActiveInvalidMessageText={validationVisible}
          withLabel
          labelPlaceholder={t('auth.forms.labels.nickname')}
          maxLength={255}
          editable={!isPending}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View>
        <s.TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.forms.placeholders.enterEmail')}
          field="email"
          enableInvalidMessageText
          isActiveInvalidMessageText={validationVisible}
          withLabel
          labelPlaceholder={t('auth.forms.labels.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          enableInvalidMessageText
          isActiveInvalidMessageText={validationVisible}
          withLabel
          labelPlaceholder={t('auth.forms.labels.password')}
          editable={!isPending}
          returnKeyType="next"
        />
      </View>

      <View>
        <s.PasswordField
          value={repeatedPassword}
          onChangeText={setRepeatedPassword}
          placeholder={t('auth.forms.placeholders.confirmPassword')}
          field="password"
          enableInvalidMessageText
          isActiveInvalidMessageText={validationVisible}
          withLabel
          labelPlaceholder={t('auth.forms.labels.repeatPassword')}
          editable={!isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <s.SubmitButton onPress={submit} loading={isPending}>
        <s.SubmitButtonText>
          {t('auth.forms.buttons.signUp')}
        </s.SubmitButtonText>
      </s.SubmitButton>

      {!isPending && footer}
    </s.Form>
  );
};
