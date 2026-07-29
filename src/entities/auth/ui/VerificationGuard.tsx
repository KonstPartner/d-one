import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import * as styles from '@entities/auth/styles/VerificationGuard';
import { Button, LoadingView, Spinner } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api/hooks';
import { useAuth } from '@features/auth/model';
import * as globalStyles from '@features/shared/styles/global';

const VerificationGuard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const { authUser } = useAuth();
  const { authData, isAuthLoading } = useAuthData();

  const message = authUser
    ? t('auth.guard.verifyEmail')
    : t('auth.guard.loginToAccess');

  if (isAuthLoading) {
    return (
      <View style={styles.ViewSpinnerStyle}>
        <Spinner size={32} />
      </View>
    );
  }

  if (authData && authUser?.emailVerified) {
    return <LoadingView loading={isAuthLoading}>{children}</LoadingView>;
  }

  return (
    <View
      style={[styles.ViewStyle, globalStyles.FloatContainer(theme)]}
      className={className}
    >
      <Text style={styles.TextStyle(theme)}>{message}</Text>

      <Button
        style={styles.ButtonStyles(theme)}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Text style={globalStyles.TextWhite}>
          {t('auth.guard.goToProfile')}
        </Text>
      </Button>
    </View>
  );
};

export default VerificationGuard;
