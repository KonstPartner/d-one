import type { AuthSessionResult } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';

import { decodeJwtPayload } from '@shared/lib/jwt';

import { GOOGLE_AUTH_REDIRECT_URI, GOOGLE_DISCOVERY } from './googleAuthConfig';

export type GoogleRegisterPrefill = {
  email: string;
  nickname: string;
};

const getRawIdToken = (rawResponse: unknown): string | null => {
  if (
    typeof rawResponse !== 'object' ||
    rawResponse === null ||
    !('id_token' in rawResponse)
  ) {
    return null;
  }

  const idToken = rawResponse.id_token;

  return typeof idToken === 'string' ? idToken : null;
};

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

  return tokenResponse.idToken ?? getRawIdToken(tokenResponse.rawResponse);
};

export const buildGoogleRegisterPrefill = (
  idToken: string
): GoogleRegisterPrefill => {
  const payload = decodeJwtPayload<unknown>(idToken);

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('email' in payload) ||
    typeof payload.email !== 'string'
  ) {
    throw new Error('custom/no-google-email');
  }

  const email = payload.email.trim().toLowerCase();

  if (!email) {
    throw new Error('custom/no-google-email');
  }

  const nickname =
    'name' in payload && typeof payload.name === 'string'
      ? payload.name.trim()
      : '';

  return {
    email,
    nickname,
  };
};
