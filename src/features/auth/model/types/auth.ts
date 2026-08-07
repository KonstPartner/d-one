export type AuthFormMode = 'log-in' | 'sign-up';

export type LoginUserFormValues = {
  email: string;
  password: string;
};

export type RegisterUserFormValues = {
  nickname: string;
  email: string;
  password: string;
  repeatedPassword: string;
};

export type RegisterUserPayload = Omit<
  RegisterUserFormValues,
  'repeatedPassword'
>;

export type LoginFormErrors = Partial<
  Record<keyof LoginUserFormValues, string>
>;

export type RegisterFormErrors = Partial<
  Record<keyof RegisterUserFormValues, string>
>;
