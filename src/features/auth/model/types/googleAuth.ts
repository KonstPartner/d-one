import { RegisterUserFormValues } from '@features/auth/model/types';

export type GoogleIdTokenPayload = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export type GoogleRegisterPrefill = Pick<
  RegisterUserFormValues,
  'email' | 'nickname'
>;
