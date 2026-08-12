export const AI_USAGE_POLICY = {
  userDailyLimit: 5,
  requestCooldownSeconds: 30,
  activeLeaseSeconds: 90,
} as const;

export type AiUsageLimitErrorCode =
  | 'USER_DAILY_LIMIT_REACHED'
  | 'PROJECT_DAILY_LIMIT_REACHED'
  | 'REQUEST_TOO_FREQUENT'
  | 'AI_REQUEST_ALREADY_ACTIVE';

export class AiUsageLimitError extends Error {
  public constructor(public readonly code: AiUsageLimitErrorCode) {
    super(code);
    this.name = 'AiUsageLimitError';
  }
}

export type UserUsageSnapshot = {
  request_count: number;
  latest_last_request_at: number | null;
  latest_active_until: number | null;
};

export const assertProjectDailyLimit = (value: number): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error('INVALID_AI_PROJECT_DAILY_LIMIT');
  }
};

export const getUtcDay = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const getPreviousUtcDay = (date: Date): string => {
  const previousDay = new Date(date);

  previousDay.setUTCDate(previousDay.getUTCDate() - 1);

  return getUtcDay(previousDay);
};

export const resolveUserUsageLimitError = (
  snapshot: UserUsageSnapshot,
  nowSeconds: number,
  cooldownThreshold: number,
): AiUsageLimitError => {
  if (
    snapshot.latest_active_until !== null &&
    snapshot.latest_active_until > nowSeconds
  ) {
    return new AiUsageLimitError('AI_REQUEST_ALREADY_ACTIVE');
  }

  if (snapshot.request_count >= AI_USAGE_POLICY.userDailyLimit) {
    return new AiUsageLimitError('USER_DAILY_LIMIT_REACHED');
  }

  if (
    snapshot.latest_last_request_at !== null &&
    snapshot.latest_last_request_at > cooldownThreshold
  ) {
    return new AiUsageLimitError('REQUEST_TOO_FREQUENT');
  }

  throw new Error('AI_USAGE_RESERVATION_REJECTED');
};
