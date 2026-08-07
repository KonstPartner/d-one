import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthSessionResult } from 'expo-auth-session';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';
import { type UserProfile, userProfileQueryKeys } from '@entities/user';

import { getIdTokenFromResponse } from '../../model/utils/googleAuth';
import { authMutationKeys } from '../authMutationKeys';
import { loginWithGoogle } from '../loginWithGoogle';

const useGoogleAuth = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, AuthSessionResult>({
    mutationKey: authMutationKeys.googleLogin,

    mutationFn: (response: AuthSessionResult) => {
      const idToken = getIdTokenFromResponse(response);

      if (!idToken) {
        throw new Error('custom/no-google-id-token');
      }

      return loginWithGoogle(idToken);
    },

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);

      showNotification('success', t('auth.notifications.loginSuccess'));
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useGoogleAuth;
