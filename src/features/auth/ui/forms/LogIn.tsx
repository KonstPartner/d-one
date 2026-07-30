import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from '@entities/shared/ui';

import {
  GoogleRegisterPrefill,
  LoginUserFormValues,
  useLoginForm,
} from '../../model';
import * as styles from '../../styles/forms/AuthForm';
import ResetPasswordModal from '../ResetPasswordModal';

import GoogleSignInButton from './GoogleSignIn';

type LogInFormProps = {
  onSubmit: (data: LoginUserFormValues) => Promise<boolean>;

  isSending: boolean;

  onSignUpPress: () => void;

  onGoogleRegister: (prefill: GoogleRegisterPrefill) => void;
};

const LogInForm = ({
  onSubmit,
  isSending,
  onSignUpPress,
  onGoogleRegister,
}: LogInFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { email, setEmail, password, setPassword, handleSubmit } = useLoginForm(
    {
      onSubmit,
    }
  );

  return (
    <View style={styles.Form(theme)}>
      <View>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.forms.placeholders.enterEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          field="email"
          withLabel
          labelPlaceholder={t('auth.forms.labels.email')}
          style={styles.Input(theme)}
          editable={!isSending}
          returnKeyType="next"
        />
      </View>

      <View>
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.forms.placeholders.enterPassword')}
          field="password"
          withLabel
          labelPlaceholder={t('auth.forms.labels.password')}
          style={styles.Input(theme)}
          editable={!isSending}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      <View style={styles.ForgotPasswordRow}>
        <ResetPasswordModal />
      </View>

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

      <View style={styles.Divider(theme)}>
        <View style={styles.DividerLine(theme)} />

        <Text style={styles.DividerText(theme)}>{t('auth.forms.or')}</Text>

        <View style={styles.DividerLine(theme)} />
      </View>

      <GoogleSignInButton onRegister={onGoogleRegister} />

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
