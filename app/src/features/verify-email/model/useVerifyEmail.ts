import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useSession } from '@entities/session';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import {
  checkEmailVerification,
  sendVerificationEmail,
} from '../api/emailVerification';

export const useVerifyEmail = () => {
  const { t } = useTranslation();

  const { sessionUser, syncSessionUser } = useSession();

  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const sendMutation = useMutation({
    mutationFn: sendVerificationEmail,

    onSuccess: () => {
      setVerificationEmailSent(true);

      showNotification(
        'success',
        t('auth.notifications.email.verificationMessageSent')
      );
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const checkMutation = useMutation({
    mutationFn: checkEmailVerification,

    onSuccess: (emailVerified) => {
      if (!emailVerified) {
        showNotification('error', t('auth.notifications.email.notVerified'));

        return;
      }

      syncSessionUser();

      showNotification(
        'success',
        t('auth.notifications.email.verifiedSuccess')
      );
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const isPending = sendMutation.isPending || checkMutation.isPending;

  const send = () => {
    if (isPending || verificationEmailSent) {
      return;
    }

    sendMutation.mutate();
  };

  const check = () => {
    if (isPending) {
      return;
    }

    checkMutation.mutate();
  };

  return {
    email: sessionUser?.email ?? null,

    verificationEmailSent,
    isPending,

    send,
    check,
  };
};
