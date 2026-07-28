export const userQueryKeys = {
  all: ['auth'] as const,

  userDataRoot: ['auth', 'user-data'] as const,

  userData: (uid: string) => [...userQueryKeys.userDataRoot, uid] as const,

  mutations: ['auth', 'mutation'] as const,

  login: ['auth', 'mutation', 'login'] as const,

  register: ['auth', 'mutation', 'register'] as const,

  logout: ['auth', 'mutation', 'logout'] as const,
};
