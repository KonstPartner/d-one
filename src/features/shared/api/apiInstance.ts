import { getAuthToken } from '@features/auth/api/firebase/services/getAuthToken';
import { deepTrim } from '@features/shared/model';

export class ApiError extends Error {
  constructor(
    public response: Response,
    public data?: unknown
  ) {
    super(
      (data as any)?.message ||
        (data as any)?.error ||
        `Request failed with status ${response.status}`
    );
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

type ApiInstanceOptions = {
  baseUrl: string;
  baseEnpoint?: string;
  defaultAuth?: boolean;
};

const pickErrorMessage = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return 'Unknown error';
  }

  for (const key of ['message', 'error', 'description', 'detail']) {
    if ((data as any)[key]) {
      return String((data as any)[key]);
    }
  }

  return 'Unknown error';
};

export const apiInstance = ({
  baseUrl,
  baseEnpoint = '',
  defaultAuth = false,
}: ApiInstanceOptions) => {
  const request = async <T>(
    url: string,
    init: ApiRequestInit = {}
  ): Promise<T> => {
    const finalBaseUrl = init.omitBaseEndpoint
      ? baseUrl
      : baseUrl + baseEnpoint;

    const fullUrl = url.startsWith('http') ? url : `${finalBaseUrl}${url}`;

    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string>),
    };

    if (init.json !== undefined && init.formData) {
      throw new Error('Use either json or formData, not both');
    }

    if (init.json !== undefined) {
      init.body = init.stringify
        ? (init.json as BodyInit | null | undefined)
        : JSON.stringify(deepTrim({ data: init.json }));
    }

    if (init.formData) {
      init.body = init.formData;
    }

    headers['Accept'] ||= 'application/json';

    const isJsonBody = init.json !== undefined;
    const isWriteMethod = init.method === 'POST' || init.method === 'PATCH';

    if (isJsonBody && isWriteMethod) {
      headers['Content-Type'] ||= 'application/json';
    }

    if (init.formData) {
      delete headers['Content-Type'];
    }

    const needAuth = init.auth ?? defaultAuth;
    if (needAuth) {
      const token = await getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const res = await fetch(fullUrl, {
      ...init,
      headers,
    });

    if (res.status === 204) {
      return true as T;
    }

    const text = await res.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const message = pickErrorMessage(data);
      throw new ApiError(res, { ...(data as any), message });
    }

    return data as T;
  };

  return {
    request,

    get: <T>(
      url: string,
      init: Omit<ApiRequestInit, 'method' | 'body' | 'json' | 'formData'> = {}
    ) => request<T>(url, { ...init, method: 'GET' }),

    post: <T>(
      url: string,
      json?: unknown,
      init: Omit<ApiRequestInit, 'method' | 'body' | 'json' | 'formData'> = {}
    ) => request<T>(url, { ...init, method: 'POST', json }),

    patch: <T>(
      url: string,
      json?: unknown,
      init: Omit<ApiRequestInit, 'method' | 'body' | 'json' | 'formData'> = {}
    ) => request<T>(url, { ...init, method: 'PATCH', json }),

    delete: <T>(
      url: string,
      init: Omit<ApiRequestInit, 'method' | 'body' | 'json' | 'formData'> = {}
    ) => request<T>(url, { ...init, method: 'DELETE' }),

    postForm: <T>(
      url: string,
      formData: FormData,
      init: Omit<ApiRequestInit, 'method' | 'body' | 'json' | 'formData'> = {}
    ) => request<T>(url, { ...init, method: 'POST', formData }),
  };
};
