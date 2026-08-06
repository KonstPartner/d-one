import type { UserRole } from '@features/auth/model';
import { isPathAllowed, type RoutePath, ROUTES } from '@shared/routes';

import { ROUTE_ACCESS } from './accessPolicy';

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
}: GetGuardRedirectPathParams): RoutePath | null => {
  if (!hasAuthUser) {
    return isPathAllowed(pathname, ROUTE_ACCESS.guest) ? null : ROUTES.auth;
  }

  if (!emailVerified) {
    return isPathAllowed(pathname, ROUTE_ACCESS.unverified)
      ? null
      : ROUTES.auth;
  }

  if (authRole === null) {
    return isPathAllowed(pathname, ROUTE_ACCESS.pending)
      ? null
      : ROUTES.pending;
  }

  return isPathAllowed(pathname, ROUTE_ACCESS[authRole]) ? null : ROUTES.diary;
};
