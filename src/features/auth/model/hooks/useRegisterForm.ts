import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RegisterUserFormValues } from '@features/auth/model';
import { validateInput } from '@features/shared/model';
import { showNotification } from '@features/shared/ui';

const useRegisterForm = ({
  onSubmit,
}: {
  onSubmit: (data: RegisterUserFormValues) => Promise<boolean>;
}) => {
  const { t } = useTranslation();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');

  const [isActiveInvalidMessageText, setIsActiveInvalidMessageText] =
    useState(false);

  const handleSubmit = async () => {
    setIsActiveInvalidMessageText(true);

    const isNicknameValid = validateInput('nickname', nickname, {
      sendErrorNotification: true,
    });

    const isEmailValid = validateInput('email', email, {
      sendErrorNotification: true,
    });

    const isPasswordValid = validateInput('password', password, {
      sendErrorNotification: true,
    });

    if (!isNicknameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    if (password !== repeatedPassword) {
      showNotification('error', t('auth.notifications.passwordMismatch'));

      return;
    }

    const succeeded = await onSubmit({
      nickname: nickname.trim(),
      email: email.trim(),
      password,
      repeatedPassword,
    });

    if (succeeded) {
      setPassword('');
      setRepeatedPassword('');
      setIsActiveInvalidMessageText(false);
    }
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
    isActiveInvalidMessageText,
    handleSubmit,
  };
};

export default useRegisterForm;
