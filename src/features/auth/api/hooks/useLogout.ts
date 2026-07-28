import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { userQueryKeys } from '@features/auth/api/constants';
import { logoutUser } from '@features/auth/api/firebase';
import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

const useLogout = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: userQueryKeys.all,
      });

      showNotification('success', t('auth.notifications.logoutSuccess'));
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useLogout;
