import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useSession } from '@entities/session';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';
import { validateInput } from '@shared/lib/validation';

import {
  confirmEmailUpdate,
  type EmailUpdateConfirmation,
  requestEmailUpdate,
} from '../api/updateEmail';

export type UpdateEmailMode = 'view' | 'edit' | 'sent';

export const useUpdateEmail = () => {
  const { t } = useTranslation();

  const { sessionUser, syncSessionUser } = useSession();

  const sessionEmail = (sessionUser?.email ?? '').trim();

  const [currentEmail, setCurrentEmail] = useState(sessionEmail);

  const [mode, setMode] = useState<UpdateEmailMode>('view');

  const [email, setEmail] = useState(sessionEmail);

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [validationVisible, setValidationVisible] = useState(false);

  useEffect(() => {
    setCurrentEmail(sessionEmail);
    setEmail(sessionEmail);
    setPendingEmail(null);
    setValidationVisible(false);
    setMode('view');
  }, [sessionEmail]);

  const isDirty = useMemo(
    () => email.trim().toLowerCase() !== currentEmail.toLowerCase(),
    [email, currentEmail]
  );

  const complete = (confirmedEmail: string): void => {
    setCurrentEmail(confirmedEmail);
    setEmail(confirmedEmail);
    setPendingEmail(null);
    setValidationVisible(false);
    setMode('view');

    syncSessionUser();

    showNotification('success', t('auth.notifications.email.verifiedRelogin'));
  };

  const requestMutation = useMutation({
    mutationFn: requestEmailUpdate,

    onSuccess: (_, nextEmail) => {
      const normalizedEmail = nextEmail.trim();

      setPendingEmail(normalizedEmail);
      setValidationVisible(false);
      setMode('sent');

      showNotification(
        'success',
        t('auth.notifications.email.verificationSentToNew')
      );
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmEmailUpdate,

    onSuccess: (result: EmailUpdateConfirmation, expectedEmail) => {
      if (result === 'not-verified') {
        showNotification('error', t('auth.notifications.email.notVerifiedYet'));

        return;
      }

      complete(expectedEmail);
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const isLoading = requestMutation.isPending || confirmMutation.isPending;

  const startEdit = (): void => {
    setEmail(currentEmail);
    setPendingEmail(null);
    setValidationVisible(false);
    setMode('edit');
  };

  const cancel = (): void => {
    if (isLoading) {
      return;
    }

    setEmail(currentEmail);
    setPendingEmail(null);
    setValidationVisible(false);
    setMode('view');
  };

  const sendVerification = (): void => {
    if (isLoading) {
      return;
    }

    if (!sessionUser) {
      showNotification('error', t('auth.notifications.notAuthenticated'));

      return;
    }

    setValidationVisible(true);

    const nextEmail = email.trim();

    const isEmailValid =
      validateInput('email', nextEmail, {
        sendErrorNotification: true,
      }) === true;

    if (!isEmailValid) {
      return;
    }

    if (!isDirty) {
      showNotification('error', t('auth.notifications.email.same'));

      return;
    }

    requestMutation.mutate(nextEmail);
  };

  const confirmVerified = (): void => {
    if (isLoading || !sessionUser || !pendingEmail) {
      return;
    }

    confirmMutation.mutate(pendingEmail);
  };

  return {
    isAuthenticated: sessionUser !== null,

    mode,

    currentEmail,

    email,
    setEmail,

    pendingEmail,

    isDirty,
    isLoading,
    validationVisible,

    canConfirm: mode === 'sent' && !isLoading,

    startEdit,
    cancel,
    sendVerification,
    confirmVerified,
  };
};
