import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthSessionResult } from 'expo-auth-session';
import { useTranslation } from 'react-i18next';

import { userQueryKeys } from '@features/auth/api/constants';
import { loginWithGoogle } from '@features/auth/api/firebase';
import type { UserData } from '@features/auth/model/types';
import { getIdTokenFromResponse } from '@features/auth/model/utils';
import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

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
