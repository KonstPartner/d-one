import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';

import {
  LoginUserFormValues,
  RegisterUserPayload,
} from '../../../model/types/auth';
import { auth } from '../config';

export const loginAuthUser = async (
  payload: LoginUserFormValues
): Promise<User> => {
  const credential = await signInWithEmailAndPassword(
    auth,
    payload.email.trim(),
    payload.password
  );

  return credential.user;
};

export const registerAuthUser = async (
  payload: RegisterUserPayload
): Promise<User> => {
  const nickname = payload.nickname.trim();
  const email = payload.email.trim();

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    payload.password
  );

  await updateProfile(credential.user, {
    displayName: nickname,
  });

  return credential.user;
};
