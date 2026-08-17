import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';
import { validateInput } from '@shared/lib/validation';

import {
  changePassword,
  type ChangePasswordPayload,
} from '../api/changePassword';

export const useChangePassword = () => {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [repeatedPassword, setRepeatedPassword] = useState('');

  const [validationVisible, setValidationVisible] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),

    onSuccess: () => {
      setNewPassword('');

      showNotification(
        'success',
        t('auth.notifications.password.changedSuccess')
      );
    },

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'firebase'));
    },

    onSettled: () => {
      setCurrentPassword('');
      setRepeatedPassword('');
      setValidationVisible(false);
    },
  });

  const submit = (): void => {
    if (mutation.isPending) {
      return;
    }

    setValidationVisible(true);

    const isNewPasswordValid =
      validateInput('password', newPassword, {
        sendErrorNotification: true,
      }) === true;

    if (!isNewPasswordValid) {
      return;
    }

    if (newPassword !== repeatedPassword) {
      showNotification('error', t('auth.notifications.password.newMismatch'));

      return;
    }

    mutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return {
    currentPassword,
    setCurrentPassword,

    newPassword,
    setNewPassword,

    repeatedPassword,
    setRepeatedPassword,

    validationVisible,
    isPending: mutation.isPending,

    submit,
  };
};
