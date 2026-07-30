import { RegisterUserFormValues } from './auth';

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
