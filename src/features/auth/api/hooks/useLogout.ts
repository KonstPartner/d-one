import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

import { authMutationKeys } from '../authMutationKeys';
import { logout } from '../logout';

const useLogout = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationKey: authMutationKeys.logout,

    mutationFn: logout,

    onSuccess: () => {
      showNotification('success', t('auth.notifications.logoutSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useLogout;
