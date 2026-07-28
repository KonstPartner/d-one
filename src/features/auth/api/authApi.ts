import { queryOptions } from '@tanstack/react-query';
import { User } from 'firebase/auth';

import { userQueryKeys } from '@features/auth/api/constants';
import {
  getOrCreateUserProfile,
  loginAuthUser,
  registerAuthUser,
} from '@features/auth/api/firebase/services';
import {
  LoginUserFormValues,
  RegisterUserPayload,
  UserData,
} from '@features/auth/model';
import { FORCE_CACHE } from '@features/shared/api';

export const authApi = {
  baseKey: 'auth',

  getUserDataOptions: (authUser: User | null) =>
    queryOptions<UserData>({
      queryKey: userQueryKeys.userData(authUser?.uid ?? 'anonymous'),

      queryFn: async () => {
        if (!authUser) {
          throw new Error('custom/not-authenticated');
        }

        return getOrCreateUserProfile(authUser);
      },

      ...FORCE_CACHE,
    }),

  loginWithEmail: async (payload: LoginUserFormValues): Promise<UserData> => {
    const user = await loginAuthUser(payload);

    return getOrCreateUserProfile(user);
  },

  registerWithEmail: async (
    payload: RegisterUserPayload
  ): Promise<UserData> => {
    const user = await registerAuthUser(payload);

    return getOrCreateUserProfile(user, payload.nickname);
  },
};
