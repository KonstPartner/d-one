import { UserRole } from '@entities/user';
import { type RoutePath, ROUTES } from '@shared/routes';

type RouteAccessPolicy = {
  guest: readonly RoutePath[];
  unverified: readonly RoutePath[];
  pending: readonly RoutePath[];

  [UserRole.User]: readonly RoutePath[];

  [UserRole.Follower]: readonly RoutePath[];
};

export const ROUTE_ACCESS = {
  guest: [ROUTES.auth, ROUTES.authCallback],

  unverified: [ROUTES.auth, ROUTES.authCallback],

  pending: [ROUTES.pending, ROUTES.profile],

  [UserRole.User]: [ROUTES.diary, ROUTES.cloud, ROUTES.profile],

  [UserRole.Follower]: [ROUTES.diary, ROUTES.profile],
} as const satisfies RouteAccessPolicy;
