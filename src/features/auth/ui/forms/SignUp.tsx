import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from '@entities/shared/ui';
import { RegisterUserFormValues, useRegisterForm } from '@features/auth/model';
import * as styles from '@features/auth/styles/forms/AuthForm';

type SignUpFormProps = {
  onSubmit: (data: RegisterUserFormValues) => Promise<boolean>;
  isSending: boolean;
  onSignInPress: () => void;
};

const SignUpForm = ({
  onSubmit,
  isSending,
  onSignInPress,
}: SignUpFormProps) => {
  const theme = useTheme();
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
    isActiveInvalidMessageText,
    handleSubmit,
  } = useRegisterForm({ onSubmit });

  return (
    <View style={styles.Form(theme)}>
      <Input
        value={nickname}
        onChangeText={setNickname}
        placeholder={t('auth.forms.placeholders.enterNickname')}
        field="nickname"
        enableInvalidMessageText
        isActiveInvalidMessageText={isActiveInvalidMessageText}
        withLabel
        labelPlaceholder={t('auth.forms.labels.nickname')}
        maxLength={255}
        style={styles.Input(theme)}
        editable={!isSending}
        autoCapitalize="none"
        returnKeyType="next"
      />

      <Input
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.forms.placeholders.enterEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        field="email"
        enableInvalidMessageText
        isActiveInvalidMessageText={isActiveInvalidMessageText}
        withLabel
        labelPlaceholder={t('auth.forms.labels.email')}
        style={styles.Input(theme)}
        editable={!isSending}
        returnKeyType="next"
      />

      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.forms.placeholders.enterPassword')}
        field="password"
        enableInvalidMessageText
        isActiveInvalidMessageText={isActiveInvalidMessageText}
        withLabel
        labelPlaceholder={t('auth.forms.labels.password')}
        style={styles.Input(theme)}
        editable={!isSending}
        returnKeyType="next"
      />

      <PasswordInput
        value={repeatedPassword}
        onChangeText={setRepeatedPassword}
        placeholder={t('auth.forms.placeholders.confirmPassword')}
        withLabel
        labelPlaceholder={t('auth.forms.labels.repeatPassword')}
        style={styles.Input(theme)}
        editable={!isSending}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button
        style={styles.SubmitButton(theme, isSending)}
        onPress={handleSubmit}
        disabled={isSending}
        onDisableSpinner
      >
        <Text style={styles.SubmitButtonText(theme)}>
          {t('auth.forms.buttons.signUp')}
        </Text>
      </Button>

      {!isSending && (
        <View style={styles.SwitchFormRow(theme)}>
          <Text style={styles.SwitchFormText(theme)}>
            {t('auth.forms.links.haveAccount')}
          </Text>

          <Pressable accessibilityRole="button" onPress={onSignInPress}>
            <Text style={styles.SwitchFormLink(theme)}>
              {t('auth.forms.links.logIn')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default SignUpForm;
