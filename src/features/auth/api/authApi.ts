import { queryOptions } from '@tanstack/react-query';

import { userQueryKeys } from '@features/auth/api/constants';
import { AuthUserData } from '@features/auth/model';
import { backendApi, FORCE_CACHE } from '@features/shared/api';

export const authApi = {
  baseKey: 'auth',

  getUserDataOptions: (uid: string) =>
    queryOptions<AuthUserData | null>({
      queryKey: userQueryKeys.userData(uid),

      queryFn: async ({ signal }) => {
        try {
          return await backendApi.get<AuthUserData>('', {
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
