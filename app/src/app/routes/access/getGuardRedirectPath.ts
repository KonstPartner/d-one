import { UserRole } from '@entities/user';
import { isPathAllowed, type RoutePath, ROUTES } from '@shared/routes';

import { ROUTE_ACCESS } from './accessPolicy';

type GetGuardRedirectPathParams = {
  pathname: string;

  hasSessionUser: boolean;

  emailVerified: boolean;

  role: UserRole | null;
};

const getRoleHomePath = (role: UserRole): RoutePath => {
  switch (role) {
    case UserRole.User:
      return ROUTES.diary;

    case UserRole.Follower:
      return ROUTES.followerDiary;
  }
};

export const getGuardRedirectPath = ({
  pathname,

  hasSessionUser,

  emailVerified,

  role,
}: GetGuardRedirectPathParams): RoutePath | null => {
  if (!hasSessionUser) {
    return isPathAllowed(pathname, ROUTE_ACCESS.guest) ? null : ROUTES.auth;
  }

  if (!emailVerified) {
    return isPathAllowed(pathname, ROUTE_ACCESS.unverified)
      ? null
      : ROUTES.auth;
  }

  if (role === null) {
    return isPathAllowed(pathname, ROUTE_ACCESS.pending)
      ? null
      : ROUTES.pending;
  }

  return isPathAllowed(pathname, ROUTE_ACCESS[role])
    ? null
    : getRoleHomePath(role);
};
