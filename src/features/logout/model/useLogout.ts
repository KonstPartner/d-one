import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { logout } from '../api/logout';

export const useLogout = () => {
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      showNotification('success', t('auth.notifications.logoutSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
  };
};
