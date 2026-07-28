import { ScrollView } from 'react-native';
import { useTheme } from '@emotion/react';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import * as styles from '@features/auth/styles/Auth';
import { AuthForms } from '@features/auth/ui';

const Auth = () => {
  const theme = useTheme();
  const { isAuthLoading } = useAuthData();

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
            <AuthForms />
          </ScrollView>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Auth;
