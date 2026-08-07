import {
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { GoogleRegisterPrefill } from '../model/googleAuthToken';
import { useGoogleSignIn } from '../model/useGoogleSignIn';
import * as s from '../styles/GoogleSignIn';

type GoogleSignInButtonProps = {
  onRegister: (prefill: GoogleRegisterPrefill) => void;
  style?: StyleProp<ViewStyle>;
};

export const GoogleSignInButton = ({
  onRegister,
  style,
}: GoogleSignInButtonProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { isDisabled, isPending, signIn } = useGoogleSignIn({
    onRegister,
  });

  return (
    <s.Button
      style={style}
      onPress={signIn}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: isPending,
      }}
    >
      {isPending ? (
        <ActivityIndicator size="small" color={theme.colors.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color={theme.colors.text} />

          <s.ButtonText>{t('auth.forms.buttons.googleSignIn')}</s.ButtonText>
        </>
      )}
    </s.Button>
  );
};
