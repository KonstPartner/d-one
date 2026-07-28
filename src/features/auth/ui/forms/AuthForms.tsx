import { useAuthForm } from '@features/auth/model/hooks';

import LogInForm from './LogIn';
import SignUpForm from './SignUp';

const AuthForms = () => {
  const {
    chosenForm,
    setChosenForm,
    handleLogin,
    handleRegister,
    isLoginPending,
    isRegisterPending,
  } = useAuthForm();

  if (chosenForm === 'sign-up') {
    return (
      <SignUpForm
        onSubmit={handleRegister}
        isSending={isRegisterPending}
        onSignInPress={() => setChosenForm('log-in')}
      />
    );
  }

  return (
    <LogInForm
      onSubmit={handleLogin}
      isSending={isLoginPending}
      onSignUpPress={() => setChosenForm('sign-up')}
    />
  );
};

export default AuthForms;
