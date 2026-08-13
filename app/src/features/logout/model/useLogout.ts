import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { logout as logoutRequest } from '../api/logout';

export const useLogout = () => {
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: logoutRequest,

    onSuccess: () => {
      showNotification('success', t('auth.notifications.logoutSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const logout = () => {
    mutation.mutate();
  };

  return {
    logout,
    isPending: mutation.isPending,
  };
};
