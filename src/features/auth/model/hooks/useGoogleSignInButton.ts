import { useCallback, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { Href, router, usePathname } from 'expo-router';

import { useGoogleAuth } from '@features/auth/api';
import { checkUserExistsByEmail } from '@features/auth/api/firebase';
import {
  getGoogleClientId,
  GOOGLE_AUTH_REDIRECT_URI,
  GOOGLE_AUTH_SCOPES,
  googleClientIds,
} from '@features/auth/model/constants';
import { useAuth } from '@features/auth/model/context';
import type { GoogleRegisterPrefill } from '@features/auth/model/types';
import {
  buildGoogleRegisterPrefill,
  exchangeGoogleCodeForIdToken,
  getIdTokenFromResponse,
  withIdTokenResponse,
} from '@features/auth/model/utils';
import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

type UseGoogleSignInButtonParams = {
  onRegister: (data: GoogleRegisterPrefill) => void;
};

const useGoogleSignInButton = ({ onRegister }: UseGoogleSignInButtonParams) => {
  const pathname = usePathname();

  const { authUser } = useAuth();

  const { mutateAsync: googleAuth } = useGoogleAuth();

  const returnPathRef = useRef<string>(pathname);

  const [isPressed, setIsPressed] = useState(false);

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

      router.replace(returnPathRef.current as Href);
    });
  }, []);

  const onGooglePress = useCallback(async () => {
    if (!request || isPressed) {
      return;
    }

    returnPathRef.current = pathname;

    setIsPressed(true);

    let googleAuthMutationStarted = false;

    try {
      if (authUser) {
        throw new Error('custom/already-logged-in!');
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

      const { isExists } = await checkUserExistsByEmail(prefill.email ?? '');

      if (!isExists) {
        onRegister(prefill);

        returnToAuthForm();

        return;
      }

      const responseWithIdToken = withIdTokenResponse({
        response,
        idToken,
      });

      googleAuthMutationStarted = true;

      await googleAuth(responseWithIdToken);
    } catch (error) {
      if (!googleAuthMutationStarted) {
        const errorMessage = errorMapper(error, 'firebase');

        showNotification('error', errorMessage);
      }
    } finally {
      setIsPressed(false);
    }
  }, [
    request,
    isPressed,
    pathname,
    authUser,
    promptAsync,
    googleAuth,
    onRegister,
    returnToAuthForm,
  ]);

  return {
    isPressed,

    isDisabled: isPressed || !request,

    onGooglePress,
  };
};

export default useGoogleSignInButton;
