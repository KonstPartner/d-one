import { AuthForm } from '@widgets/auth-form';
import { LogoutButton } from '@features/auth/logout';
import { VerifyEmail } from '@features/auth/verify-email';
import { useSession } from '@entities/session';
import { Loader, LoadingView, PageLayout } from '@shared/ui';

import * as s from '../styles/AuthPage';

export const AuthPage = () => {
  const { sessionUser, emailVerified, isSessionReady } = useSession();

  const isEmailVerificationRequired = sessionUser !== null && !emailVerified;

  return (
    <PageLayout edges={['bottom', 'right', 'left']}>
      <LoadingView loading={!isSessionReady}>
        <Loader errorType="api">
          <s.PageScroll
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <s.PageBody>
              {isEmailVerificationRequired ? (
                <s.VerificationContent>
                  <VerifyEmail />

                  <LogoutButton />
                </s.VerificationContent>
              ) : (
                <AuthForm />
              )}
            </s.PageBody>
          </s.PageScroll>
        </Loader>
      </LoadingView>
    </PageLayout>
  );
};
