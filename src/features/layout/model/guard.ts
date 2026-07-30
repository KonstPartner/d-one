import { UserRole } from '@features/auth/model';

import {
  AUTH_PATH,
  DIARY_PATH,
  FOLLOWER_PATHS,
  GUEST_PATHS,
  PENDING_PATH,
  PENDING_PATHS,
  UNVERIFIED_PATHS,
  USER_PATHS,
} from './constants';
import { isPathAllowed, normalizePath } from './path';

type GetGuardRedirectPathParams = {
  pathname: string;
  hasAuthUser: boolean;
  emailVerified: boolean;
  authRole: UserRole | null;
};

export const getGuardRedirectPath = ({
  pathname,
  hasAuthUser,
  emailVerified,
  authRole,
}: GetGuardRedirectPathParams): string | null => {
  const normalizedPathname = normalizePath(pathname);

  if (!hasAuthUser) {
    return isPathAllowed(normalizedPathname, GUEST_PATHS) ? null : AUTH_PATH;
  }

  if (!emailVerified) {
    return isPathAllowed(normalizedPathname, UNVERIFIED_PATHS)
      ? null
      : AUTH_PATH;
  }

  if (authRole === null) {
    return isPathAllowed(normalizedPathname, PENDING_PATHS)
      ? null
      : PENDING_PATH;
  }

  if (authRole === UserRole.Follower) {
    return isPathAllowed(normalizedPathname, FOLLOWER_PATHS)
      ? null
      : DIARY_PATH;
  }

  return isPathAllowed(normalizedPathname, USER_PATHS) ? null : DIARY_PATH;
};
