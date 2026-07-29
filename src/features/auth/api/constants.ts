const AUTH_QUERY_KEY = ['auth'] as const;
const AUTH_MUTATION_KEY = ['auth', 'mutation'] as const;

export const userQueryKeys = {
  all: AUTH_QUERY_KEY,

  userDataRoot: [...AUTH_QUERY_KEY, 'user-data'] as const,

  userData: (uid: string) => [...AUTH_QUERY_KEY, 'user-data', uid] as const,

  mutations: AUTH_MUTATION_KEY,

  login: [...AUTH_MUTATION_KEY, 'login'] as const,

  register: [...AUTH_MUTATION_KEY, 'register'] as const,

  googleLogin: [...AUTH_MUTATION_KEY, 'google-login'] as const,

  logout: [...AUTH_MUTATION_KEY, 'logout'] as const,
};
