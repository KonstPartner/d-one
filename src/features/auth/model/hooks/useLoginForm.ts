import { useState } from 'react';

import { LoginUserFormValues } from '@features/auth/model';

const useLoginForm = ({
  onSubmit,
}: {
  onSubmit: (data: LoginUserFormValues) => Promise<boolean>;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      return;
    }

    const succeeded = await onSubmit({
      email: email.trim(),
      password,
    });

    if (succeeded) {
      setPassword('');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
};

export default useLoginForm;
