export const userQueryKeys = {
  all: ['auth'],
  userData: (uid: string) => [...userQueryKeys.all, 'user-data', uid] as const,
};
