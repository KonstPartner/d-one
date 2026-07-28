import { queryOptions } from '@tanstack/react-query';
import { User } from 'firebase/auth';

import { userQueryKeys } from '@features/auth/api/constants';
import {
  loginAuthUser,
  registerAuthUser,
} from '@features/auth/api/firebase/services';
import { createUserProfile } from '@features/auth/api/firebase/services/createUserProfile';
import { getUserProfile } from '@features/auth/api/firebase/services/getUserProfile';
import {
  LoginUserFormValues,
  RegisterUserPayload,
  UserData,
} from '@features/auth/model';

export const authApi = {
  baseKey: 'auth',

  getUserDataOptions: (authUser: User | null) =>
    queryOptions({
      queryKey: authUser
        ? userQueryKeys.userData(authUser.uid)
        : userQueryKeys.userDataRoot,

      queryFn: () => {
        if (!authUser) {
          throw new Error('custom/no-user-is-currently-logged-in');
        }

        return getUserProfile(authUser.uid);
      },

      enabled: Boolean(authUser),
      staleTime: Infinity,
    }),

  loginWithEmail: async (payload: LoginUserFormValues): Promise<UserData> => {
    const user = await loginAuthUser(payload);

    return getUserProfile(user.uid);
  },

  registerWithEmail: async (
    payload: RegisterUserPayload
  ): Promise<UserData> => {
    const user = await registerAuthUser(payload);

    return createUserProfile(user, payload.nickname);
  },
};
