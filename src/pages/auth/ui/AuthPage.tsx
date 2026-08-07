import { StyleSheet } from 'react-native';
import styled from '@emotion/native';

import { AuthForms, LogoutButton } from '@features/auth/ui';
import { VerifyEmail } from '@features/verify-email';
import { useSession } from '@entities/session';
import { Loader, LoadingView } from '@entities/shared/ui';
import { PageLayout } from '@shared/ui';

export const AuthPage = () => {
  const { sessionUser, emailVerified, isSessionReady } = useSession();

  const isEmailVerificationRequired = sessionUser !== null && !emailVerified;

  return (
    <PageLayout edges={['bottom', 'right', 'left']}>
      <LoadingView loading={!isSessionReady}>
        <Loader errorType="api">
          <PageScroll
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PageBody>
              {isEmailVerificationRequired ? (
                <VerificationContent>
                  <VerifyEmail />

                  <LogoutButton />
                </VerificationContent>
              ) : (
                <AuthForms />
              )}
            </PageBody>
          </PageScroll>
        </Loader>
      </LoadingView>
    </PageLayout>
  );
};

const PageScroll = styled.ScrollView`
  flex: 1;
`;

const PageBody = styled.View`
  flex: 1;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const VerificationContent = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
