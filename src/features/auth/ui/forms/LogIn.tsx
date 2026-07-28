import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from '@entities/shared/ui';
import { LoginUserFormValues, useLoginForm } from '@features/auth/model';
import * as styles from '@features/auth/styles/forms/AuthForm';

type LogInFormProps = {
  onSubmit: (data: LoginUserFormValues) => Promise<boolean>;
  isSending: boolean;
  onSignUpPress: () => void;
};

const LogInForm = ({ onSubmit, isSending, onSignUpPress }: LogInFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    email,
    setEmail,
    password,
    setPassword,
    isActiveInvalidMessageText,
    handleSubmit,
  } = useLoginForm({ onSubmit });

  return (
    <View style={styles.Form(theme)}>
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
          {t('auth.forms.buttons.logIn')}
        </Text>
      </Button>

      {!isSending && (
        <View style={styles.SwitchFormRow(theme)}>
          <Text style={styles.SwitchFormText(theme)}>
            {t('auth.forms.links.noAccount')}
          </Text>

          <Pressable accessibilityRole="button" onPress={onSignUpPress}>
            <Text style={styles.SwitchFormLink(theme)}>
              {t('auth.forms.links.signUp')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default LogInForm;
