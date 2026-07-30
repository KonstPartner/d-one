import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthSessionResult } from 'expo-auth-session';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

import type { UserData } from '../../model/types';
import { getIdTokenFromResponse } from '../../model/utils';
import { userQueryKeys } from '../constants';
import { loginWithGoogle } from '../firebase';

const useGoogleAuth = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<UserData, Error, AuthSessionResult>({
    mutationKey: userQueryKeys.googleLogin,

    mutationFn: (response: AuthSessionResult) => {
      const idToken = getIdTokenFromResponse(response);

      if (!idToken) {
        throw new Error('custom/no-google-id-token');
      }

      return loginWithGoogle(idToken);
    },

    onSuccess: (userData) => {
      queryClient.setQueryData(userQueryKeys.userData(userData.uid), userData);

      showNotification('success', t('auth.notifications.loginSuccess'));
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useGoogleAuth;
