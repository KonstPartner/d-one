import { useState } from 'react';

import { LoginUserFormValues } from '@features/auth/model';
import { validateInput } from '@features/shared/model';

const useLoginForm = ({
  onSubmit,
}: {
  onSubmit: (data: LoginUserFormValues) => Promise<boolean>;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isActiveInvalidMessageText, setIsActiveInvalidMessageText] =
    useState(false);

  const handleSubmit = async () => {
    setIsActiveInvalidMessageText(true);

    const isEmailValid = validateInput('email', email, {
      sendErrorNotification: true,
    });

    const isPasswordValid = validateInput('password', password, {
      sendErrorNotification: true,
    });

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    const succeeded = await onSubmit({
      email: email.trim(),
      password,
    });

    if (succeeded) {
      setPassword('');
      setIsActiveInvalidMessageText(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isActiveInvalidMessageText,
    handleSubmit,
  };
};

export default useLoginForm;
