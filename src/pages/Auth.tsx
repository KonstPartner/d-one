import { ScrollView, View } from 'react-native';
import { useTheme } from '@emotion/react';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { useAuth } from '@features/auth/model';
import * as styles from '@features/auth/styles/Auth';
import { AuthForms, LogoutButton, VerifyEmail } from '@features/auth/ui';

const Auth = () => {
  const theme = useTheme();

  const { authUser, emailVerified } = useAuth();

  const { isAuthLoading } = useAuthData();

  const isEmailVerificationRequired = Boolean(authUser) && !emailVerified;

  return (
    <PageWrapper edges={['bottom', 'right', 'left']}>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="api">
          <ScrollView
            style={styles.Scroll}
            contentContainerStyle={styles.ScrollContent(theme)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isEmailVerificationRequired ? (
              <View style={styles.VerificationContent(theme)}>
                <VerifyEmail />

                <LogoutButton />
              </View>
            ) : (
              <AuthForms />
            )}
          </ScrollView>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Auth;
