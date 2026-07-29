import type { AuthSessionResult } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';

import {
  GOOGLE_AUTH_REDIRECT_URI,
  GOOGLE_DISCOVERY,
} from '@features/auth/model/constants';
import type {
  GoogleIdTokenPayload,
  GoogleRegisterPrefill,
} from '@features/auth/model/types';
import { decodeJwtPayload } from '@features/shared/model';

export const getIdTokenFromResponse = (
  response: AuthSessionResult
): string | null => {
  if (response.type !== 'success') {
    return null;
  }

  return response.params?.id_token ?? response.authentication?.idToken ?? null;
};

export const exchangeGoogleCodeForIdToken = async ({
  code,
  codeVerifier,
  clientId,
}: {
  code: string;
  codeVerifier: string;
  clientId: string;
}): Promise<string | null> => {
  if (!GOOGLE_AUTH_REDIRECT_URI) {
    throw new Error('custom/no-google-redirect-uri');
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code,
      redirectUri: GOOGLE_AUTH_REDIRECT_URI,

      extraParams: {
        code_verifier: codeVerifier,
      },
    },
    GOOGLE_DISCOVERY
  );

  return (
    tokenResponse.idToken ??
    (tokenResponse.rawResponse as { id_token?: string } | undefined)
      ?.id_token ??
    null
  );
};

export const withIdTokenResponse = ({
  response,
  idToken,
}: {
  response: AuthSessionResult;
  idToken: string;
}): AuthSessionResult => {
  if (response.type !== 'success') {
    return response;
  }

  return {
    ...response,

    params: {
      ...response.params,
      id_token: idToken,
    },
  };
};

export const buildGoogleRegisterPrefill = (
  idToken: string
): GoogleRegisterPrefill => {
  const payload = decodeJwtPayload<GoogleIdTokenPayload>(idToken);

  if (!payload?.email) {
    throw new Error('custom/no-google-email');
  }

  return {
    email: payload.email.trim().toLowerCase(),

    nickname: payload.name?.trim() ?? '',
  };
};
