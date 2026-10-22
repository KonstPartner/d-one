export type ApiErrorPayload = {
  code: string;
  message: string | null;
  reason: string | null;
};

const normalizeText = (value: string): string | null => {
  const normalized = value.trim();

  return normalized.length === 0 ? null : normalized;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getOptionalText = (
  record: Record<string, unknown>,
  key: string
): string | null => {
  const value = record[key];

  return typeof value === 'string' ? normalizeText(value) : null;
};

export const parseApiErrorPayload = (data: unknown): ApiErrorPayload | null => {
  if (!isRecord(data) || !isRecord(data.error)) {
    return null;
  }

  const error = data.error;
  const code = getOptionalText(error, 'code');

  if (code === null) {
    return null;
  }

  return {
    code,
    message: getOptionalText(error, 'message'),
    reason: getOptionalText(error, 'reason'),
  };
};

const getApiErrorMessage = (data: unknown): string | null => {
  if (typeof data === 'string') {
    return normalizeText(data);
  }

  if (!isRecord(data)) {
    return null;
  }

  const payload = parseApiErrorPayload(data);

  if (payload?.message !== null && payload?.message !== undefined) {
    return payload.message;
  }

  for (const key of ['message', 'description', 'detail']) {
    const value = getOptionalText(data, key);

    if (value !== null) {
      return value;
    }
  }

  if (typeof data.error === 'string') {
    return normalizeText(data.error);
  }

  if (isRecord(data.error)) {
    for (const key of ['message', 'description', 'detail']) {
      const value = getOptionalText(data.error, key);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
};

export class ApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(getApiErrorMessage(data) ?? `Request failed with status ${status}`);

    this.name = 'ApiError';
  }
}
