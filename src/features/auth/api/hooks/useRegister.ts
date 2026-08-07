import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';
import { userProfileQueryKeys } from '@entities/user';

import type { RegisterUserPayload } from '../../model/types/auth';
import { registerWithEmail } from '../authApi';
import { authMutationKeys } from '../authMutationKeys';

const useRegister = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authMutationKeys.register,

    mutationFn: (payload: RegisterUserPayload) => registerWithEmail(payload),

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);

      showNotification('success', t('auth.notifications.registerSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useRegister;
