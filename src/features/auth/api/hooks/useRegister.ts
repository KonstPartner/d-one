import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

import { RegisterUserPayload } from '../../model/types/auth';
import { authApi } from '../authApi';
import { userQueryKeys } from '../constants';

const useRegister = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userQueryKeys.register,

    mutationFn: (payload: RegisterUserPayload) =>
      authApi.registerWithEmail(payload),

    onSuccess: (userData) => {
      queryClient.setQueryData(userQueryKeys.userData(userData.uid), userData);

      showNotification('success', t('auth.notifications.registerSuccess'));
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useRegister;
