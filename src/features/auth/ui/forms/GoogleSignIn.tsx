import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { LoadingView } from '@entities/shared/ui';

import type { GoogleRegisterPrefill } from '../../model';
import { useGoogleSignInButton } from '../../model';
import * as styles from '../../styles/forms/GoogleSignIn';

type GoogleSignInButtonProps = {
  onRegister: (prefill: GoogleRegisterPrefill) => void;
  style?: StyleProp<ViewStyle>;
};

const GoogleSignInButton = ({ onRegister, style }: GoogleSignInButtonProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { isDisabled, onGooglePress } = useGoogleSignInButton({
    onRegister,
  });

  return (
    <LoadingView loading={isDisabled}>
      <Pressable
        style={[styles.ButtonStyle(theme, isDisabled), style]}
        onPress={onGooglePress}
        disabled={isDisabled}
        accessibilityRole="button"
      >
        <Ionicons name="logo-google" size={20} color={theme.colors.text} />

        <Text style={styles.ButtonText(theme)}>
          {t('auth.forms.buttons.googleSignIn')}
        </Text>
      </Pressable>
    </LoadingView>
  );
};

export default GoogleSignInButton;
