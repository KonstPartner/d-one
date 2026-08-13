import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sessionMutationKeys } from '@entities/session';
import { type UserProfile, userProfileQueryKeys } from '@entities/user';

import { loginWithGoogle } from './loginWithGoogle';

export const useGoogleSignInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, string>({
    mutationKey: sessionMutationKeys.operation('google-sign-in'),

    mutationFn: loginWithGoogle,

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);
    },
  });
};
