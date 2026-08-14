export const ROUTES = {
  root: '/',
  auth: '/auth',
  authCallback: '/auth-callback',

  diary: '/diary',
  followerDiary: '/follower-diary',
  cloud: '/cloud',

  pending: '/pending',
  profile: '/profile',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
