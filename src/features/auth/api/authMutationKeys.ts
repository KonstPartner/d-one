import { sessionMutationKeys } from '@entities/session';

export const authMutationKeys = {
  root: sessionMutationKeys.root,

  login: sessionMutationKeys.operation('login'),

  register: sessionMutationKeys.operation('register'),

  googleLogin: sessionMutationKeys.operation('google-sign-in'),

  logout: sessionMutationKeys.operation('logout'),
};
