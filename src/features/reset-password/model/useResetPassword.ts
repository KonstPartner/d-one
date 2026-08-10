import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';
import { validateInput } from '@shared/lib/validation';

import { requestPasswordReset } from '../api/requestPasswordReset';

export const useResetPassword = () => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);

  const [email, setEmail] = useState('');

  const [validationVisible, setValidationVisible] = useState(false);

  const resetForm = () => {
    setEmail('');
    setValidationVisible(false);
  };

  const mutation = useMutation({
    mutationFn: requestPasswordReset,

    onSuccess: () => {
      showNotification('success', t('auth.forgotPassword.successText'));

      setVisible(false);
      resetForm();
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },
  });

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    if (mutation.isPending) {
      return;
    }

    setVisible(false);
    resetForm();
  };

  const changeEmail = (value: string) => {
    setEmail(value);

    if (validationVisible) {
      setValidationVisible(false);
    }
  };

  const submit = () => {
    if (mutation.isPending) {
      return;
    }

    setValidationVisible(true);

    if (!validateInput('email', email)) {
      return;
    }

    mutation.mutate(email);
  };

  return {
    visible,
    email,

    validationVisible,
    isPending: mutation.isPending,

    open,
    close,
    changeEmail,
    submit,
  };
};
