import {
  getUserProfile,
  saveLocalUserProfile,
  type UserProfile,
} from '@entities/user';

import type {
  LoginUserFormValues,
  RegisterUserPayload,
} from '../model/types/auth';

import { loginAuthUser, registerAuthUser } from './firebase/services/authUser';
import { createUserProfile } from './firebase/services/createUserProfile';

export const loginWithEmail = async (
  payload: LoginUserFormValues
): Promise<UserProfile> => {
  const sessionUser = await loginAuthUser(payload);

  return getUserProfile(sessionUser.uid);
};

export const registerWithEmail = async (
  payload: RegisterUserPayload
): Promise<UserProfile> => {
  const sessionUser = await registerAuthUser(payload);

  const profile = await createUserProfile(sessionUser, payload.nickname);

  await saveLocalUserProfile(profile);

  return profile;
};
