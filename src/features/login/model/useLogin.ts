import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useSession } from '@entities/session';
import { userProfileQueryKeys } from '@entities/user';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { loginWithEmail } from '../api/loginWithEmail';

export const useLogin = () => {
  const { t } = useTranslation();

  const { sessionUser } = useSession();

  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: loginWithEmail,

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);

      setPassword('');

      showNotification('success', t('auth.notifications.loginSuccess'));
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const submit = (): void => {
    if (mutation.isPending) {
      return;
    }

    if (sessionUser) {
      showNotification(
        'error',
        errorMapper(new Error('custom/already-logged-in'), 'firebase')
      );

      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      return;
    }

    mutation.mutate({
      email: normalizedEmail,
      password,
    });
  };

  return {
    email,
    setEmail,

    password,
    setPassword,

    isPending: mutation.isPending,

    submit,
  };
};
