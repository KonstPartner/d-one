import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from '@entities/shared/ui';

import {
  GoogleRegisterPrefill,
  RegisterUserFormValues,
  useRegisterForm,
} from '../../model';
import * as styles from '../../styles/forms/AuthForm';

type SignUpFormProps = {
  onSubmit: (data: RegisterUserFormValues) => Promise<boolean>;
  isSending: boolean;
  onSignInPress: () => void;
  prefill?: GoogleRegisterPrefill | null;
};

const SignUpForm = ({
  onSubmit,
  isSending,
  onSignInPress,
  prefill,
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
  } = useRegisterForm({
    onSubmit,
  });

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setNickname(prefill.nickname);
    setEmail(prefill.email);
  }, [prefill, setNickname, setEmail]);

  return (
    <View style={styles.Form(theme)}>
      <View>
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
          editable={!isSending}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          style={styles.Input(theme)}
        />
      </View>

      <View>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.forms.placeholders.enterEmail')}
          field="email"
          enableInvalidMessageText
          isActiveInvalidMessageText={isActiveInvalidMessageText}
          withLabel
          labelPlaceholder={t('auth.forms.labels.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSending}
          returnKeyType="next"
          style={styles.Input(theme)}
        />
      </View>

      <View>
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.forms.placeholders.enterPassword')}
          field="password"
          enableInvalidMessageText
          isActiveInvalidMessageText={isActiveInvalidMessageText}
          withLabel
          labelPlaceholder={t('auth.forms.labels.password')}
          editable={!isSending}
          returnKeyType="next"
          style={styles.Input(theme)}
        />
      </View>

      <View>
        <PasswordInput
          value={repeatedPassword}
          onChangeText={setRepeatedPassword}
          placeholder={t('auth.forms.placeholders.confirmPassword')}
          field="password"
          enableInvalidMessageText
          isActiveInvalidMessageText={isActiveInvalidMessageText}
          withLabel
          labelPlaceholder={t('auth.forms.labels.repeatPassword')}
          editable={!isSending}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          style={styles.Input(theme)}
        />
      </View>

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
