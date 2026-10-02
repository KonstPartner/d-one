export const AI_USAGE_POLICY = {
  userDailyLimit: 15,
  requestCooldownSeconds: 30,
  activeLeaseSeconds: 150,
} as const;

export type AiUsageRejectionCode =
  | 'USER_DAILY_LIMIT_REACHED'
  | 'PROJECT_DAILY_LIMIT_REACHED'
  | 'REQUEST_TOO_FREQUENT'
  | 'AI_REQUEST_ALREADY_ACTIVE';

export const isAiUsageRejectionCode = (
  code: string,
): code is AiUsageRejectionCode =>
  code === 'USER_DAILY_LIMIT_REACHED' ||
  code === 'PROJECT_DAILY_LIMIT_REACHED' ||
  code === 'REQUEST_TOO_FREQUENT' ||
  code === 'AI_REQUEST_ALREADY_ACTIVE';

export type UserUsageSnapshot = {
  request_count: number;
  latest_last_request_at: number | null;
  latest_active_until: number | null;
};

export const getUtcDay = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const getPreviousUtcDay = (date: Date): string => {
  const previousDay = new Date(date);

  previousDay.setUTCDate(previousDay.getUTCDate() - 1);

  return getUtcDay(previousDay);
};

export const resolveUserUsageRejectionCode = (
  snapshot: UserUsageSnapshot,
  nowSeconds: number,
  cooldownThreshold: number,
): AiUsageRejectionCode => {
  if (
    snapshot.latest_active_until !== null &&
    snapshot.latest_active_until > nowSeconds
  ) {
    return 'AI_REQUEST_ALREADY_ACTIVE';
  }

  if (snapshot.request_count >= AI_USAGE_POLICY.userDailyLimit) {
    return 'USER_DAILY_LIMIT_REACHED';
  }

  if (
    snapshot.latest_last_request_at !== null &&
    snapshot.latest_last_request_at > cooldownThreshold
  ) {
    return 'REQUEST_TOO_FREQUENT';
  }

  throw new Error('AI_USAGE_RESERVATION_REJECTED');
};
