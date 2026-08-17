import { useCallback, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useSession } from '@entities/session';
import { showNotification } from '@shared/lib/notifications';
import { ROUTES } from '@shared/routes';

import { checkUserExistsByEmail } from '../api/checkUserExistsByEmail';
import { useGoogleSignInMutation } from '../api/useGoogleSignInMutation';

import {
  getGoogleClientId,
  GOOGLE_AUTH_REDIRECT_URI,
  GOOGLE_AUTH_SCOPES,
  googleClientIds,
} from './googleAuthConfig';
import {
  buildGoogleRegisterPrefill,
  exchangeGoogleCodeForIdToken,
  getIdTokenFromResponse,
  type GoogleRegisterPrefill,
} from './googleAuthToken';

type UseGoogleSignInParams = {
  onRegister: (prefill: GoogleRegisterPrefill) => void;
};

const GOOGLE_ERROR_KEYS = [
  ['custom/already-logged-in', 'common.errors.alreadyLoggedIn'],
  ['custom/no-google-auth', 'common.errors.googleAuthorizationFailed'],
  ['custom/no-google-id-token', 'common.errors.googleIdTokenMissing'],
  ['custom/no-google-email', 'common.errors.googleEmailMissing'],
  ['custom/no-google-redirect-uri', 'common.errors.googleRedirectUriMissing'],
  ['custom/invalid-google-id-token', 'common.errors.invalidGoogleIdToken'],
  ['auth/too-many-requests', 'common.errors.tooManyRequests'],
] as const;

const getGoogleSignInErrorMessage = (error: unknown, t: TFunction): string => {
  if (!(error instanceof Error)) {
    return t('common.errors.unknown');
  }

  const mappedError = GOOGLE_ERROR_KEYS.find(([matcher]) =>
    error.message.includes(matcher)
  );

  if (mappedError) {
    return t(mappedError[1]);
  }

  console.error('Google sign-in failed:', error);

  return error.message;
};

export const useGoogleSignIn = ({ onRegister }: UseGoogleSignInParams) => {
  const { t } = useTranslation();

  const { sessionUser } = useSession();

  const { mutateAsync: authenticateWithGoogle, isPending } =
    useGoogleSignInMutation();

  const inFlightRef = useRef(false);

  const [isPromptPending, setIsPromptPending] = useState(false);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    selectAccount: true,

    ...googleClientIds,

    scopes: GOOGLE_AUTH_SCOPES,

    shouldAutoExchangeCode: false,

    ...(GOOGLE_AUTH_REDIRECT_URI
      ? {
          redirectUri: GOOGLE_AUTH_REDIRECT_URI,
        }
      : {}),
  });

  const returnToAuthForm = useCallback(() => {
    requestAnimationFrame(() => {
      if (router.canGoBack()) {
        router.back();

        return;
      }

      router.replace(ROUTES.auth);
    });
  }, []);

  const signIn = useCallback(async () => {
    if (!request || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setIsPromptPending(true);

    try {
      if (sessionUser) {
        throw new Error('custom/already-logged-in');
      }

      const response = await promptAsync();

      if (response.type !== 'success') {
        return;
      }

      let idToken = getIdTokenFromResponse(response);

      if (!idToken) {
        const code = response.params?.code;
        const codeVerifier = request.codeVerifier;
        const clientId = getGoogleClientId();

        if (!code || !codeVerifier || !clientId) {
          throw new Error('custom/no-google-auth');
        }

        idToken = await exchangeGoogleCodeForIdToken({
          code,
          codeVerifier,
          clientId,
        });
      }

      if (!idToken) {
        throw new Error('custom/no-google-id-token');
      }

      const prefill = buildGoogleRegisterPrefill(idToken);

      const { isExists } = await checkUserExistsByEmail(prefill.email);

      if (!isExists) {
        onRegister(prefill);
        returnToAuthForm();

        return;
      }

      await authenticateWithGoogle(idToken);

      showNotification('success', t('auth.notifications.loginSuccess'));
    } catch (error: unknown) {
      showNotification('error', getGoogleSignInErrorMessage(error, t));
    } finally {
      inFlightRef.current = false;
      setIsPromptPending(false);
    }
  }, [
    request,
    sessionUser,
    promptAsync,
    onRegister,
    returnToAuthForm,
    authenticateWithGoogle,
    t,
  ]);

  const pending = isPromptPending || isPending;

  return {
    isPending: pending,
    isDisabled: !request || pending,
    signIn,
  };
};
