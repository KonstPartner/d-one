import { queryOptions } from '@tanstack/react-query';
import type { User } from 'firebase/auth';

import { FORCE_CACHE } from '@features/shared/api/constants';

import { saveLocalUserProfile } from '../model/context/localProfileStorage';
import type {
  LoginUserFormValues,
  RegisterUserPayload,
  UserData,
} from '../model/types/auth';

import { userQueryKeys } from './constants';
import { loginAuthUser } from './firebase/services/authUser';
import { registerAuthUser } from './firebase/services/authUser';
import { createUserProfile } from './firebase/services/createUserProfile';
import { getUserData } from './getUserData';

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
