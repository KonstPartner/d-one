export { app, auth, db } from './firebase/config';
export { getAuthToken } from './firebase/getAuthToken';
export type { ApiRequestInit } from './http/createApiClient';
export { ApiError, createApiClient } from './http/createApiClient';
export { queryClient } from './queryClient';
export {
  DEFAULT_CACHE,
  DEFAULT_GC_TIME,
  DEFAULT_STALE_TIME,
  FORCE_CACHE,
} from './queryConfig';

export const getFirebaseAppCheckToken = async (): Promise<string> => {
  const appCheck = await import('./firebase/appCheck');

  return appCheck.getFirebaseAppCheckToken();
};
