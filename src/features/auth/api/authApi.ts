import { queryOptions } from '@tanstack/react-query';
import type { User } from 'firebase/auth';

import { userQueryKeys } from '@features/auth/api/constants';
import {
  loginAuthUser,
  registerAuthUser,
} from '@features/auth/api/firebase/services';
import { createUserProfile } from '@features/auth/api/firebase/services/createUserProfile';
import { getUserData } from '@features/auth/api/getUserData';
import type {
  LoginUserFormValues,
  RegisterUserPayload,
  UserData,
} from '@features/auth/model';
import { saveLocalUserProfile } from '@features/auth/model/context';
import { FORCE_CACHE } from '@features/shared/api';

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

        return getUserData(authUser);
      },

      enabled: Boolean(authUser),
      ...FORCE_CACHE,
    }),

  loginWithEmail: async (payload: LoginUserFormValues): Promise<UserData> => {
    const user = await loginAuthUser(payload);

    return getUserData(user);
  },

  registerWithEmail: async (
    payload: RegisterUserPayload
  ): Promise<UserData> => {
    const user = await registerAuthUser(payload);

    const profile = await createUserProfile(user, payload.nickname);

    await saveLocalUserProfile(profile);

    return profile;
  },
};
