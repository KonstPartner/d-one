import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { sessionMutationKeys, useSession } from '@entities/session';
import { userProfileQueryKeys } from '@entities/user';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';
import { validateInput } from '@shared/lib/validation';

import {
  type RegisterPayload,
  registerWithEmail,
} from '../api/registerWithEmail';

export type RegisterPrefill = Pick<RegisterPayload, 'nickname' | 'email'>;

type UseRegisterOptions = {
  prefill?: RegisterPrefill | null;
};

export const useRegister = ({ prefill }: UseRegisterOptions = {}) => {
  const { t } = useTranslation();

  const { sessionUser } = useSession();

  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [repeatedPassword, setRepeatedPassword] = useState('');

  const [validationVisible, setValidationVisible] = useState(false);

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setNickname(prefill.nickname);
    setEmail(prefill.email);
  }, [prefill]);

  const mutation = useMutation({
    mutationKey: sessionMutationKeys.operation('register'),

    mutationFn: registerWithEmail,

    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(profile.uid), profile);

      setPassword('');
      setRepeatedPassword('');
      setValidationVisible(false);

      showNotification('success', t('auth.notifications.registerSuccess'));
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

    setValidationVisible(true);

    const isNicknameValid =
      validateInput('nickname', nickname, {
        sendErrorNotification: true,
      }) === true;

    const isEmailValid =
      validateInput('email', email, {
        sendErrorNotification: true,
      }) === true;

    const isPasswordValid =
      validateInput('password', password, {
        sendErrorNotification: true,
      }) === true;

    if (!isNicknameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    if (password !== repeatedPassword) {
      showNotification('error', t('auth.notifications.passwordMismatch'));

      return;
    }

    mutation.mutate({
      nickname: nickname.trim(),
      email: email.trim(),
      password,
    });
  };

  return {
    nickname,
    setNickname,

    email,
    setEmail,

    password,
    setPassword,

    repeatedPassword,
    setRepeatedPassword,

    validationVisible,
    isPending: mutation.isPending,

    submit,
  };
};
