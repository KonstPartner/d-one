import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose';

const FIREBASE_APP_CHECK_JWKS_URL =
  'https://firebaseappcheck.googleapis.com/v1/jwks';

const FIREBASE_APP_CHECK_JWKS = createRemoteJWKSet(
  new URL(FIREBASE_APP_CHECK_JWKS_URL),
);

export type FirebaseAppCheckErrorCode =
  | 'APP_CHECK_REQUIRED'
  | 'INVALID_APP_CHECK_TOKEN'
  | 'APP_NOT_ALLOWED'
  | 'APP_CHECK_SERVICE_UNAVAILABLE';

export class FirebaseAppCheckError extends Error {
  public constructor(public readonly code: FirebaseAppCheckErrorCode) {
    super(code);
    this.name = 'FirebaseAppCheckError';
  }
}

type VerifyFirebaseAppCheckTokenParams = {
  token: string;
  projectNumber: string;
  allowedAppIds: readonly string[];
};

export type VerifiedFirebaseApp = {
  appId: string;
};

export const getAppCheckToken = (request: Request): string => {
  const token = request.headers.get('x-firebase-appcheck')?.trim();

  if (!token) {
    throw new FirebaseAppCheckError('APP_CHECK_REQUIRED');
  }

  return token;
};

export const verifyFirebaseAppCheckToken = async ({
  token,
  projectNumber,
  allowedAppIds,
}: VerifyFirebaseAppCheckTokenParams): Promise<VerifiedFirebaseApp> => {
  let protectedHeader;

  try {
    protectedHeader = decodeProtectedHeader(token);
  } catch {
    throw new FirebaseAppCheckError('INVALID_APP_CHECK_TOKEN');
  }

  if (protectedHeader.alg !== 'RS256' || protectedHeader.typ !== 'JWT') {
    throw new FirebaseAppCheckError('INVALID_APP_CHECK_TOKEN');
  }

  let payload;

  try {
    const result = await jwtVerify(token, FIREBASE_APP_CHECK_JWKS, {
      algorithms: ['RS256'],
      issuer: `https://firebaseappcheck.googleapis.com/${projectNumber}`,
      audience: `projects/${projectNumber}`,
    });

    payload = result.payload;
  } catch {
    throw new FirebaseAppCheckError('INVALID_APP_CHECK_TOKEN');
  }

  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new FirebaseAppCheckError('INVALID_APP_CHECK_TOKEN');
  }

  if (!allowedAppIds.includes(payload.sub)) {
    throw new FirebaseAppCheckError('APP_NOT_ALLOWED');
  }

  return {
    appId: payload.sub,
  };
};
