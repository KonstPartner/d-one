import { auth } from './config';

export const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('custom/no-user-is-currently-logged-in');
  }

  return user.getIdToken();
};
