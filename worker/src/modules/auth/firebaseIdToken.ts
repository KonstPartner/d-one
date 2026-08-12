import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

const FIREBASE_CERTIFICATES_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const DEFAULT_CERTIFICATE_CACHE_MS = 5 * 60 * 1_000;

const CLOCK_TOLERANCE_SECONDS = 5;

type FirebaseCertificateCache = {
  expiresAt: number;
  keys: Map<string, CryptoKey>;
};

let certificateCache: FirebaseCertificateCache | null = null;

export type FirebaseIdTokenErrorCode =
  | 'UNAUTHORIZED'
  | 'EMAIL_NOT_VERIFIED'
  | 'AUTH_SERVICE_UNAVAILABLE';

export class FirebaseIdTokenError extends Error {
  public constructor(public readonly code: FirebaseIdTokenErrorCode) {
    super(code);
    this.name = 'FirebaseIdTokenError';
  }
}

export type VerifiedFirebaseUser = {
  uid: string;
};

const parseCacheMaxAgeMs = (cacheControl: string | null): number => {
  if (cacheControl === null) {
    return DEFAULT_CERTIFICATE_CACHE_MS;
  }

  const match = cacheControl.match(/(?:^|,)\s*max-age=(\d+)/i);

  if (match === null) {
    return DEFAULT_CERTIFICATE_CACHE_MS;
  }

  const seconds = Number(match[1]);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return DEFAULT_CERTIFICATE_CACHE_MS;
  }

  return seconds * 1_000;
};

const parseCertificateResponse = (value: unknown): Record<string, string> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
  }

  const certificates: Record<string, string> = {};

  for (const [kid, certificate] of Object.entries(value)) {
    if (
      kid.length > 0 &&
      typeof certificate === 'string' &&
      certificate.length > 0
    ) {
      certificates[kid] = certificate;
    }
  }

  if (Object.keys(certificates).length === 0) {
    throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
  }

  return certificates;
};

const loadFirebasePublicKeys = async (
  forceRefresh: boolean,
): Promise<Map<string, CryptoKey>> => {
  const now = Date.now();

  if (
    !forceRefresh &&
    certificateCache !== null &&
    certificateCache.expiresAt > now
  ) {
    return certificateCache.keys;
  }

  let response: Response;

  try {
    response = await fetch(FIREBASE_CERTIFICATES_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
  }

  if (!response.ok) {
    throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
  }

  const certificates = parseCertificateResponse(body);

  const keyEntries = await Promise.all(
    Object.entries(certificates).map(async ([kid, certificate]) => {
      try {
        const key = await importX509(certificate, 'RS256');

        return [kid, key] as const;
      } catch {
        throw new FirebaseIdTokenError('AUTH_SERVICE_UNAVAILABLE');
      }
    }),
  );

  const keys = new Map<string, CryptoKey>(keyEntries);

  certificateCache = {
    keys,
    expiresAt: now + parseCacheMaxAgeMs(response.headers.get('cache-control')),
  };

  return keys;
};

const getFirebasePublicKey = async (kid: string): Promise<CryptoKey | null> => {
  const cachedKeys = await loadFirebasePublicKeys(false);

  const cachedKey = cachedKeys.get(kid);

  if (cachedKey !== undefined) {
    return cachedKey;
  }

  const refreshedKeys = await loadFirebasePublicKeys(true);

  return refreshedKeys.get(kid) ?? null;
};

export const verifyFirebaseIdToken = async (
  token: string,
  projectId: string,
): Promise<VerifiedFirebaseUser> => {
  let protectedHeader: ReturnType<typeof decodeProtectedHeader>;

  try {
    protectedHeader = decodeProtectedHeader(token);
  } catch {
    throw new FirebaseIdTokenError('UNAUTHORIZED');
  }

  if (
    protectedHeader.alg !== 'RS256' ||
    typeof protectedHeader.kid !== 'string' ||
    protectedHeader.kid.length === 0
  ) {
    throw new FirebaseIdTokenError('UNAUTHORIZED');
  }

  const publicKey = await getFirebasePublicKey(protectedHeader.kid);

  if (publicKey === null) {
    throw new FirebaseIdTokenError('UNAUTHORIZED');
  }

  let payload;

  try {
    const result = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
    });

    payload = result.payload;
  } catch {
    throw new FirebaseIdTokenError('UNAUTHORIZED');
  }

  const nowSeconds = Date.now() / 1_000;

  if (
    typeof payload.exp !== 'number' ||
    payload.exp <= nowSeconds ||
    typeof payload.iat !== 'number' ||
    payload.iat > nowSeconds + CLOCK_TOLERANCE_SECONDS ||
    typeof payload.auth_time !== 'number' ||
    payload.auth_time > nowSeconds + CLOCK_TOLERANCE_SECONDS ||
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0
  ) {
    throw new FirebaseIdTokenError('UNAUTHORIZED');
  }

  if (payload.email_verified !== true) {
    throw new FirebaseIdTokenError('EMAIL_NOT_VERIFIED');
  }

  return {
    uid: payload.sub,
  };
};
