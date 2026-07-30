import { useEffect, useMemo, useState } from 'react';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

import { errorMapper, validateInput } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

import { useAuth } from '../../model/context';

type UiMode = 'view' | 'edit' | 'sent';

const isAuthExpiredError = (error: unknown) => {
  const message = String((error as { message?: unknown })?.message ?? '');

  const code = String((error as { code?: unknown })?.code ?? '');

  return (
    code === 'auth/user-token-expired' ||
    code === 'auth/invalid-user-token' ||
    code === 'auth/requires-recent-login' ||
    message.includes('auth/user-token-expired') ||
    message.includes('auth/invalid-user-token') ||
    message.includes('auth/requires-recent-login')
  );
};

const useUpdateUserEmail = (currentEmailFromApi?: string | null) => {
  const { t } = useTranslation();
  const { authUser } = useAuth();

  const currentEmail = (currentEmailFromApi ?? authUser?.email ?? '').trim();

  const [mode, setMode] = useState<UiMode>('view');

  const [email, setEmail] = useState(currentEmail);

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  const [isActiveInvalidMessageText, setIsActiveInvalidMessageText] =
    useState(false);

  useEffect(() => {
    setEmail(currentEmail);
    setMode('view');
    setPendingEmail(null);
  }, [currentEmail]);

  const isDirty = useMemo(() => {
    return email.trim().toLowerCase() !== currentEmail.toLowerCase();
  }, [email, currentEmail]);

  const startEdit = () => {
    setEmail(currentEmail);
    setPendingEmail(null);
    setMode('edit');
  };

  const cancel = () => {
    setEmail(currentEmail);
    setPendingEmail(null);
    setMode('view');
  };

  const complete = async () => {
    showNotification('success', t('auth.notifications.email.verifiedRelogin'));

    setMode('view');
    setPendingEmail(null);
  };

  const sendVerification = async () => {
    setIsActiveInvalidMessageText(true);

    try {
      if (!authUser) {
        showNotification('error', t('auth.notifications.notAuthenticated'));

        return;
      }

      const nextEmail = email.trim();

      if (
        !validateInput('email', nextEmail, {
          sendErrorNotification: true,
        })
      ) {
        return;
      }

      if (!isDirty) {
        showNotification('error', t('auth.notifications.email.same'));

        return;
      }

      setIsSending(true);

      await verifyBeforeUpdateEmail(authUser, nextEmail);

      setPendingEmail(nextEmail);
      setMode('sent');

      showNotification(
        'success',
        t('auth.notifications.email.verificationSentToNew')
      );
    } catch (error) {
      const message = errorMapper(error, 'firebase');

      showNotification('error', message);
    } finally {
      setIsSending(false);
    }
  };

  const confirmVerified = async () => {
    try {
      if (!authUser || !pendingEmail) {
        return;
      }

      setIsChecking(true);

      try {
        await authUser.reload();
      } catch (error) {
        if (isAuthExpiredError(error)) {
          await complete();

          return;
        }

        throw error;
      }

      const firebaseEmail = (authUser.email ?? '').trim().toLowerCase();

      const expectedEmail = pendingEmail.trim().toLowerCase();

      if (firebaseEmail !== expectedEmail) {
        showNotification('error', t('auth.notifications.email.notVerifiedYet'));

        return;
      }

      await complete();
    } catch (error) {
      const message = errorMapper(error, 'firebase');

      showNotification('error', message);
    } finally {
      setIsChecking(false);
    }
  };

  const canConfirm = mode === 'sent' && !isSending && !isChecking;

  return {
    mode,
    currentEmail,
    email,
    setEmail,
    pendingEmail,
    isDirty,
    isSending,
    isChecking,
    isLoading: isSending || isChecking,
    isActiveInvalidMessageText,
    startEdit,
    cancel,
    sendVerification,
    confirmVerified,
    canConfirm,
    t,
  };
};

export default useUpdateUserEmail;
