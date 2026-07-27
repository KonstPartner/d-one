import { apiInstance } from '@features/shared/api/apiInstance';
import { envConfig } from '@features/shared/model';

export const API_BASE_URL = envConfig.apiBaseUrl as string;

export const backendApi = apiInstance({
  baseUrl: API_BASE_URL,
});

export const DEFAULT_STALE_TIME = 5 * 60 * 1000;
export const DEFAULT_GC_TIME = 30 * 60 * 1000;

export const DEFAULT_CACHE = {
  staleTime: DEFAULT_STALE_TIME,
  gcTime: DEFAULT_GC_TIME,
};

export const FORCE_CACHE = {
  staleTime: Infinity,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
};
