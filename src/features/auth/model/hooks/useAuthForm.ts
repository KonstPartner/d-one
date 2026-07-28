import { useState } from 'react';

import useLogin from '@features/auth/api/hooks/useLogin';
import useRegister from '@features/auth/api/hooks/useRegister';
import { useAuth } from '@features/auth/model/context';
import {
  AuthFormMode,
  LoginUserFormValues,
  RegisterUserFormValues,
} from '@features/auth/model/types';
import { showNotification } from '@features/shared/ui';

const useAuthForm = () => {
  const { authUser } = useAuth();

  const { mutateAsync: login, isPending: isLoginPending } = useLogin();

  const { mutateAsync: register, isPending: isRegisterPending } = useRegister();

  const [chosenForm, setChosenForm] = useState<AuthFormMode>('log-in');

  const handleLogin = async (data: LoginUserFormValues) => {
    if (authUser) {
      showNotification('error', 'custom/already-logged-in');

      return false;
    }

    try {
      await login(data);

      return true;
    } catch {
      return false;
    }
  };

  const handleRegister = async (data: RegisterUserFormValues) => {
    if (authUser) {
      showNotification('error', 'custom/already-logged-in');

      return false;
    }

    const { repeatedPassword: _repeatedPassword, ...payload } = data;

    try {
      await register(payload);

      return true;
    } catch {
      return false;
    }
  };

  return {
    chosenForm,
    setChosenForm,

    handleLogin,
    handleRegister,

    isLoginPending,
    isRegisterPending,
  };
};

export default useAuthForm;
