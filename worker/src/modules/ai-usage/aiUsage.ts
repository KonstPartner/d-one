import {
  AI_USAGE_POLICY,
  AiUsageLimitError,
  assertProjectDailyLimit,
  getPreviousUtcDay,
  getUtcDay,
  resolveUserUsageLimitError,
} from './aiUsagePolicy';

import {
  compensateUserReservation,
  createAiUsageKeys,
  ensureUsageRows,
  finalizeUserReservation,
  getUserUsageSnapshot,
  releaseUserLease,
  tryReserveProjectUsage,
  tryReserveUserUsage,
} from './aiUsageRepository';

export type AiUsageReservation = {
  userUsageKey: string;
  projectUsageKey: string;
  reservedAt: number;
  activeUntil: number;
};

type ReserveAiUsageParams = {
  db: D1Database;
  uid: string;
  projectDailyLimit: number;
  now?: Date;
};

export const reserveAiUsage = async ({
  db,
  uid,
  projectDailyLimit,
  now = new Date(),
}: ReserveAiUsageParams): Promise<AiUsageReservation> => {
  assertProjectDailyLimit(projectDailyLimit);

  const nowSeconds = Math.floor(now.getTime() / 1000);

  const cooldownThreshold = nowSeconds - AI_USAGE_POLICY.requestCooldownSeconds;

  const activeUntil = nowSeconds + AI_USAGE_POLICY.activeLeaseSeconds;

  const day = getUtcDay(now);

  const previousDay = getPreviousUtcDay(now);

  const { userUsageKey, previousUserUsageKey, projectUsageKey } =
    createAiUsageKeys(uid, day, previousDay);

  await ensureUsageRows(db, userUsageKey, projectUsageKey);

  const userReserved = await tryReserveUserUsage({
    db,

    userUsageKey,
    previousUserUsageKey,

    userDailyLimit: AI_USAGE_POLICY.userDailyLimit,

    cooldownThreshold,
    nowSeconds,
    activeUntil,
  });

  if (!userReserved) {
    const snapshot = await getUserUsageSnapshot(
      db,
      userUsageKey,
      previousUserUsageKey,
    );

    if (snapshot === null) {
      throw new Error('AI_USAGE_STATE_NOT_FOUND');
    }

    throw resolveUserUsageLimitError(snapshot, nowSeconds, cooldownThreshold);
  }

  const reservation: AiUsageReservation = {
    userUsageKey,
    projectUsageKey,
    reservedAt: nowSeconds,
    activeUntil,
  };

  let projectReserved: boolean;

  try {
    projectReserved = await tryReserveProjectUsage(
      db,
      projectUsageKey,
      projectDailyLimit,
    );
  } catch (error) {
    await compensateUserReservation(db, reservation);

    throw error;
  }

  if (!projectReserved) {
    await compensateUserReservation(db, reservation);

    throw new AiUsageLimitError('PROJECT_DAILY_LIMIT_REACHED');
  }

  const finalized = await finalizeUserReservation(db, reservation);

  if (!finalized) {
    throw new Error('AI_USAGE_RESERVATION_FINALIZE_FAILED');
  }

  return reservation;
};

export const releaseAiUsage = async (
  db: D1Database,
  reservation: AiUsageReservation,
): Promise<void> => {
  await releaseUserLease(db, reservation);
};

export { AiUsageLimitError, type AiUsageLimitErrorCode } from './aiUsagePolicy';
