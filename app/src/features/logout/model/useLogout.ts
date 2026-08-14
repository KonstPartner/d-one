import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useDiaryTransferState } from '@entities/diary';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { logout as logoutRequest } from '../api/logout';

export const useLogout = () => {
  const { t } = useTranslation();

  const transfer = useDiaryTransferState();

  const transferLocked =
    transfer.phase === 'waitingForSync' ||
    transfer.phase === 'validating' ||
    transfer.phase === 'resolvingConflicts' ||
    transfer.phase === 'processing';

  const mutation = useMutation({
    mutationFn: logoutRequest,

    onSuccess: () => {
      showNotification('success', t('auth.notifications.logoutSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const logout = useCallback(() => {
    if (transferLocked || mutation.isPending) {
      return;
    }

    mutation.mutate();
  }, [mutation, transferLocked]);

  return {
    logout,

    isPending: mutation.isPending,

    disabled: transferLocked || mutation.isPending,
  };
};
