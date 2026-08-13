import { deepTrim } from '@shared/lib/data';

import { getAuthToken } from '../firebase/getAuthToken';

export class ApiError extends Error {
  public constructor(
    public readonly response: Response,
    public readonly data?: unknown
  ) {
    super(getResponseErrorMessage(response, data));

    this.name = 'ApiError';
  }
}

export type ApiRequestInit = RequestInit & {
  json?: unknown;
  stringify?: boolean;
  formData?: FormData;
  auth?: boolean;
  omitBaseEndpoint?: boolean;
};

type CreateApiClientOptions = {
  baseUrl: string;
  baseEndpoint?: string;
  defaultAuth?: boolean;
};

const getErrorMessageFromData = (data: unknown): string | null => {
  if (data === null || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;

  for (const key of ['message', 'error', 'description', 'detail']) {
    const value = record[key];

    if (value) {
      return String(value);
    }
  }

  return null;
};

const getResponseErrorMessage = (response: Response, data: unknown): string => {
  return (
    getErrorMessageFromData(data) ??
    `Request failed with status ${response.status}`
  );
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const createApiClient = ({
  baseUrl,
  baseEndpoint = '',
  defaultAuth = false,
}: CreateApiClientOptions) => {
  const request = async <T>(
    url: string,
    init: ApiRequestInit = {}
  ): Promise<T> => {
    if (init.json !== undefined && init.formData !== undefined) {
      throw new Error('Use either json or formData, not both');
    }

    const requestUrl = url.startsWith('http')
      ? url
      : `${init.omitBaseEndpoint ? baseUrl : baseUrl + baseEndpoint}${url}`;

    const headers = new Headers(init.headers);

    headers.set('Accept', headers.get('Accept') ?? 'application/json');

    let body = init.body;

    if (init.json !== undefined) {
      body = init.stringify
        ? String(init.json)
        : JSON.stringify(
            deepTrim({
              data: init.json,
            })
          );

      if (init.method === 'POST' || init.method === 'PATCH') {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      }
    }

    if (init.formData) {
      body = init.formData;

      headers.delete('Content-Type');
    }

    const needsAuth = init.auth ?? defaultAuth;

    if (needsAuth) {
      const token = await getAuthToken();

      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(requestUrl, {
      ...init,
      body,
      headers,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(response, data);
    }

    return data as T;
  };

  type MethodInit = Omit<
    ApiRequestInit,
    'method' | 'body' | 'json' | 'formData'
  >;

  return {
    request,

    get: <T>(url: string, init: MethodInit = {}) =>
      request<T>(url, {
        ...init,
        method: 'GET',
      }),

    post: <T>(url: string, json?: unknown, init: MethodInit = {}) =>
      request<T>(url, {
        ...init,
        method: 'POST',
        json,
      }),

    patch: <T>(url: string, json?: unknown, init: MethodInit = {}) =>
      request<T>(url, {
        ...init,
        method: 'PATCH',
        json,
      }),

    delete: <T>(url: string, init: MethodInit = {}) =>
      request<T>(url, {
        ...init,
        method: 'DELETE',
      }),

    postForm: <T>(url: string, formData: FormData, init: MethodInit = {}) =>
      request<T>(url, {
        ...init,
        method: 'POST',
        formData,
      }),
  };
};
