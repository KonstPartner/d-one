import { ApiError } from '../../shared/http/apiError';

import { verifyFirebaseIdToken } from './firebaseIdToken';
import { getUserAuthorizationProfile } from './userProfileRepository';

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

export const authorizeUser = async (
  request: Request,
  projectId: string,
): Promise<AuthorizedUser> => {
  const idToken = getBearerToken(request);

  if (idToken === null) {
    throw new ApiError('UNAUTHORIZED');
  }

  const verifiedUser = await verifyFirebaseIdToken(idToken, projectId);

  const profile = await getUserAuthorizationProfile({
    projectId,
    uid: verifiedUser.uid,
    idToken,
  });

  if (profile.role !== 'user') {
    throw new ApiError('FORBIDDEN_ROLE');
  }

  return {
    uid: verifiedUser.uid,
    idToken,
  };
};
