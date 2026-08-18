export { app, auth, db } from './firebase/config';
export { createApiClient } from './http/createApiClient';
export { queryClient } from './queryClient';
export { FORCE_CACHE } from './queryConfig';

export const getFirebaseAppCheckToken = async (): Promise<string> => {
  const appCheck = await import('./firebase/appCheck');

  return appCheck.getFirebaseAppCheckToken();
};
