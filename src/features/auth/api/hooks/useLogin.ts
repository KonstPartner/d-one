import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';
import { userProfileQueryKeys } from '@entities/user';

import type { LoginUserFormValues } from '../../model/types/auth';
import { loginWithEmail } from '../authApi';
import { authMutationKeys } from '../authMutationKeys';

const useLogin = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authMutationKeys.login,

    mutationFn: (payload: LoginUserFormValues) => loginWithEmail(payload),

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);

      showNotification('success', t('auth.notifications.loginSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useLogin;
