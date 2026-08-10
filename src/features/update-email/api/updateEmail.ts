import { verifyBeforeUpdateEmail } from 'firebase/auth';

import { auth } from '@shared/api/firebase';

export type EmailUpdateConfirmation =
  | 'verified'
  | 'not-verified'
  | 'reauthentication-required';

const AUTH_EXPIRED_ERROR_CODES = new Set([
  'auth/user-token-expired',
  'auth/invalid-user-token',
  'auth/requires-recent-login',
]);

const isAuthExpiredError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    AUTH_EXPIRED_ERROR_CODES.has(error.code)
  ) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);

  return Array.from(AUTH_EXPIRED_ERROR_CODES).some((code) =>
    message.includes(code)
  );
};

const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('custom/no-user-is-currently-logged-in');
  }

  return user;
};

export const requestEmailUpdate = async (nextEmail: string): Promise<void> => {
  const user = getCurrentUser();

  await verifyBeforeUpdateEmail(user, nextEmail.trim());
};

export const confirmEmailUpdate = async (
  expectedEmail: string
): Promise<EmailUpdateConfirmation> => {
  const user = getCurrentUser();

  try {
    await user.reload();
  } catch (error: unknown) {
    if (isAuthExpiredError(error)) {
      return 'reauthentication-required';
    }

    throw error;
  }

  const currentEmail = (user.email ?? '').trim().toLowerCase();

  const normalizedExpectedEmail = expectedEmail.trim().toLowerCase();

  return currentEmail === normalizedExpectedEmail ? 'verified' : 'not-verified';
};
