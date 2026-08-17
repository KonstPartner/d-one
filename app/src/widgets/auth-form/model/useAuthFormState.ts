import { useState } from 'react';

import type { RegisterPrefill } from '@features/auth/register';

type AuthFormMode = 'login' | 'register';

export const useAuthFormState = () => {
  const [mode, setMode] = useState<AuthFormMode>('login');

  const [registerPrefill, setRegisterPrefill] =
    useState<RegisterPrefill | null>(null);

  const openLogin = (): void => {
    setRegisterPrefill(null);
    setMode('login');
  };

  const openEmptyRegister = (): void => {
    setRegisterPrefill(null);
    setMode('register');
  };

  const openPrefilledRegister = (prefill: RegisterPrefill): void => {
    setRegisterPrefill(prefill);
    setMode('register');
  };

  return {
    isRegister: mode === 'register',
    registerPrefill,

    openLogin,
    openEmptyRegister,
    openPrefilledRegister,
  };
};
