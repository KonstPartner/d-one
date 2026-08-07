const AUTH_MUTATION_ROOT = ['auth', 'mutation'] as const;

export const authMutationKeys = {
  root: AUTH_MUTATION_ROOT,

  login: [...AUTH_MUTATION_ROOT, 'login'] as const,

  register: [...AUTH_MUTATION_ROOT, 'register'] as const,

  googleLogin: [...AUTH_MUTATION_ROOT, 'google-login'] as const,

  logout: [...AUTH_MUTATION_ROOT, 'logout'] as const,
};
