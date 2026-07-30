import { auth } from '../config';

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const token = await user.getIdToken();

  return token;
};
