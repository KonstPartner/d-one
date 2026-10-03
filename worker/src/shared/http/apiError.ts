export type ApiErrorCode =
  | 'APP_CHECK_REQUIRED'
  | 'INVALID_APP_CHECK_TOKEN'
  | 'APP_NOT_ALLOWED'
  | 'APP_CHECK_SERVICE_UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'EMAIL_NOT_VERIFIED'
  | 'FORBIDDEN_ROLE'
  | 'USER_PROFILE_NOT_FOUND'
  | 'AUTH_SERVICE_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'INVALID_IMAGE_URL'
  | 'IMAGE_NOT_ANALYZABLE'
  | 'IMAGE_TOO_LARGE'
  | 'AI_REQUEST_ALREADY_ACTIVE'
  | 'USER_DAILY_LIMIT_REACHED'
  | 'PROJECT_DAILY_LIMIT_REACHED'
  | 'REQUEST_TOO_FREQUENT'
  | 'AI_PROVIDER_ERROR'
  | 'INVALID_AI_RESPONSE'
  | 'AI_TIMEOUT'
  | 'INTERNAL_ERROR';

const API_ERROR_STATUS = {
  APP_CHECK_REQUIRED: 401,
  INVALID_APP_CHECK_TOKEN: 401,
  APP_NOT_ALLOWED: 403,
  APP_CHECK_SERVICE_UNAVAILABLE: 503,

  UNAUTHORIZED: 401,
  EMAIL_NOT_VERIFIED: 403,
  FORBIDDEN_ROLE: 403,
  USER_PROFILE_NOT_FOUND: 404,
  AUTH_SERVICE_UNAVAILABLE: 503,

  INVALID_REQUEST: 400,
  INVALID_IMAGE_URL: 400,
  IMAGE_NOT_ANALYZABLE: 400,
  IMAGE_TOO_LARGE: 413,

  AI_REQUEST_ALREADY_ACTIVE: 409,
  USER_DAILY_LIMIT_REACHED: 429,
  PROJECT_DAILY_LIMIT_REACHED: 429,
  REQUEST_TOO_FREQUENT: 429,

  AI_PROVIDER_ERROR: 503,
  INVALID_AI_RESPONSE: 502,
  AI_TIMEOUT: 504,

  INTERNAL_ERROR: 500,
} as const satisfies Record<ApiErrorCode, number>;

type ApiErrorOptions = {
  message?: string | null;
  details?: Record<string, unknown>;
  logDetails?: Record<string, unknown>;
  sourceError?: unknown;
};

const normalizeMessage = (value: string): string | null => {
  const normalized = value.trim();

  return normalized.length === 0 ? null : normalized.slice(0, 1_000);
};

const getUnknownErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error) {
    return normalizeMessage(error.message);
  }

  if (typeof error === 'string') {
    return normalizeMessage(error);
  }

  if (typeof error === 'object' && error !== null) {
    const message = (error as Record<string, unknown>).message;

    if (typeof message === 'string') {
      return normalizeMessage(message);
    }
  }

  return null;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly publicMessage: string | null;
  public readonly details: Record<string, unknown>;
  public readonly logDetails: Record<string, unknown>;
  public readonly sourceError: unknown;

  public constructor(
    public readonly code: ApiErrorCode,
    options: ApiErrorOptions = {},
  ) {
    super(code);

    this.name = 'ApiError';
    this.status = API_ERROR_STATUS[code];
    this.publicMessage =
      options.message === undefined || options.message === null
        ? null
        : normalizeMessage(options.message);
    this.details = options.details ?? {};
    this.logDetails = options.logDetails ?? this.details;
    this.sourceError = options.sourceError;
  }
}

export const resolveApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('INTERNAL_ERROR', {
    logDetails: {
      message: getUnknownErrorMessage(error),
    },
    sourceError: error,
  });
};

export const createApiErrorResponse = (error: ApiError): Response =>
  Response.json(
    {
      ok: false,
      error: {
        ...error.details,

        code: error.code,

        ...(error.publicMessage === null
          ? {}
          : {
              message: error.publicMessage,
            }),
      },
    },
    {
      status: error.status,
    },
  );

export const logUnexpectedApiError = (
  error: ApiError,
  context: string,
): void => {
  if (error.code !== 'INTERNAL_ERROR' || error.sourceError === undefined) {
    return;
  }

  console.error(context, error.sourceError);
};
