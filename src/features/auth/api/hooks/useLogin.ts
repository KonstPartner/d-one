import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { authApi } from '@features/auth/api/authApi';
import { userQueryKeys } from '@features/auth/api/constants';
import { LoginUserFormValues } from '@features/auth/model';
import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

const useLogin = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userQueryKeys.login,

    mutationFn: (payload: LoginUserFormValues) =>
      authApi.loginWithEmail(payload),

    onSuccess: (userData) => {
      queryClient.setQueryData(userQueryKeys.userData(userData.uid), userData);

      showNotification('success', t('auth.notifications.loginSuccess'));
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useLogin;
