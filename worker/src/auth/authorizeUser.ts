import { FirebaseIdTokenError, verifyFirebaseIdToken } from './firebaseIdToken';

import {
  getUserAuthorizationProfile,
  UserProfileError,
} from '../firestore/userProfile';

export type AuthorizeUserErrorCode =
  | 'UNAUTHORIZED'
  | 'EMAIL_NOT_VERIFIED'
  | 'FORBIDDEN_ROLE'
  | 'USER_PROFILE_NOT_FOUND'
  | 'INVALID_USER_PROFILE'
  | 'AUTH_SERVICE_UNAVAILABLE';

export class AuthorizeUserError extends Error {
  public constructor(public readonly code: AuthorizeUserErrorCode) {
    super(code);
    this.name = 'AuthorizeUserError';
  }
}

export type AuthorizedUser = {
  uid: string;
  idToken: string;
};

const getBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get('authorization');

  if (authorization === null) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  const token = match?.[1]?.trim();

  return token && token.length > 0 ? token : null;
};

const mapFirebaseIdTokenError = (
  error: FirebaseIdTokenError,
): AuthorizeUserError => new AuthorizeUserError(error.code);

const mapUserProfileError = (error: UserProfileError): AuthorizeUserError =>
  new AuthorizeUserError(error.code);

export const authorizeUser = async (
  request: Request,
  projectId: string,
): Promise<AuthorizedUser> => {
  const idToken = getBearerToken(request);

  if (idToken === null) {
    throw new AuthorizeUserError('UNAUTHORIZED');
  }

  let uid: string;

  try {
    const verifiedUser = await verifyFirebaseIdToken(idToken, projectId);

    uid = verifiedUser.uid;
  } catch (error) {
    if (error instanceof FirebaseIdTokenError) {
      throw mapFirebaseIdTokenError(error);
    }

    throw error;
  }

  let profile;

  try {
    profile = await getUserAuthorizationProfile({
      projectId,
      uid,
      idToken,
    });
  } catch (error) {
    if (error instanceof UserProfileError) {
      throw mapUserProfileError(error);
    }

    throw error;
  }

  if (profile.role !== 'user') {
    throw new AuthorizeUserError('FORBIDDEN_ROLE');
  }

  return {
    uid,
    idToken,
  };
};
