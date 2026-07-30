import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { errorMapper, validateInput } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

import { updateUserPassword } from '../firebase/services';

const useChangePasswordForm = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [repeatedPassword, setRepeatedPassword] = useState('');

  const [isPressed, setIsPressed] = useState(false);

  const [isActiveInvalidMessageText, setIsActiveInvalidMessageText] =
    useState(false);

  const handleChangePassword = async () => {
    setIsActiveInvalidMessageText(true);

    if (
      !validateInput('password', newPassword, {
        sendErrorNotification: true,
      })
    ) {
      return;
    }

    if (newPassword !== repeatedPassword) {
      showNotification('error', t('auth.notifications.password.newMismatch'));

      return;
    }

    setIsPressed(true);

    try {
      await updateUserPassword(currentPassword, newPassword);

      showNotification(
        'success',
        t('auth.notifications.password.changedSuccess')
      );

      setNewPassword('');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('auth/invalid-credential')
      ) {
        error.message = 'custom/invalid-credential-password';
      }

      const errorMessage = errorMapper(error, 'firebase');

      showNotification('error', errorMessage);
    } finally {
      setIsPressed(false);
      setCurrentPassword('');
      setRepeatedPassword('');
      setIsActiveInvalidMessageText(false);
    }
  };

  return {
    theme,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    repeatedPassword,
    setRepeatedPassword,
    isPressed,
    isActiveInvalidMessageText,
    handleChangePassword,
    t,
  };
};

export default useChangePasswordForm;
