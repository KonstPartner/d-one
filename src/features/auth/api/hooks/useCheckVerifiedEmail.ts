import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { auth } from '@features/auth/api/firebase/config';
import { errorMapper } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

const useCheckVerifiedEmail = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('custom/no-user-is-currently-logged-in');
      }

      await user.reload();

      if (!user.emailVerified) {
        return false;
      }

      await user.getIdToken(true);

      return true;
    },

    onSuccess: (emailVerified) => {
      if (!emailVerified) {
        showNotification('error', t('auth.notifications.email.notVerified'));

        return;
      }

      showNotification(
        'success',
        t('auth.notifications.email.verifiedSuccess')
      );
    },

    onError: (error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });
};

export default useCheckVerifiedEmail;
