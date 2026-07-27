import { queryOptions } from '@tanstack/react-query';

import { userQueryKeys } from '@features/auth/api/constants';
import { backendApi, FORCE_CACHE } from '@features/shared/api';

export const authApi = {
  baseKey: 'auth',

  getUserDataOptions: () =>
    queryOptions<any | null>({
      queryKey: userQueryKeys.userData,
      queryFn: async ({ signal }) => {
        try {
          return await backendApi.get<any>('', {
            auth: true,
            signal,
          });
        } catch {
          return null;
        }
      },
      ...FORCE_CACHE,
    }),
};
