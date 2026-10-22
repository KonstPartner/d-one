import { ApiError } from '../../shared/http/apiError';

import {
  AI_USAGE_POLICY,
  getPreviousUtcDay,
  getUtcDay,
  resolveUserUsageRejectionCode,
} from './aiUsagePolicy';

import {
  commitUserUsage,
  compensateProjectUsage,
  createAiUsageKeys,
  ensureUsageRows,
  getUserUsageSnapshot,
  releaseUserLease,
  tryReserveProjectUsage,
  tryReserveUserUsage,
} from './aiUsageRepository';

export type AiUsageReservation = {
  userUsageKey: string;
  projectUsageKey: string;
  activeUntil: number;
};

type ReserveAiUsageParams = {
  db: D1Database;
  uid: string;
  now?: Date;
};

type CommitAiUsageParams = {
  db: D1Database;
  reservation: AiUsageReservation;
  projectDailyLimit: number;
  now?: Date;
};

export const reserveAiUsage = async ({
  db,
  uid,
  now = new Date(),
}: ReserveAiUsageParams): Promise<AiUsageReservation> => {
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

    throw new ApiError(
      resolveUserUsageRejectionCode(snapshot, nowSeconds, cooldownThreshold),
    );
  }

  return {
    userUsageKey,
    projectUsageKey,
    activeUntil,
  };
};

export const commitAiUsage = async ({
  db,
  reservation,
  projectDailyLimit,
  now = new Date(),
}: CommitAiUsageParams): Promise<void> => {
  const projectReserved = await tryReserveProjectUsage(
    db,
    reservation.projectUsageKey,
    projectDailyLimit,
  );

  if (!projectReserved) {
    throw new ApiError('PROJECT_DAILY_LIMIT_REACHED');
  }

  try {
    const committed = await commitUserUsage({
      db,

      userUsageKey: reservation.userUsageKey,
      activeUntil: reservation.activeUntil,

      userDailyLimit: AI_USAGE_POLICY.userDailyLimit,
      committedAt: Math.floor(now.getTime() / 1000),
    });

    if (!committed) {
      throw new Error('AI_USAGE_COMMIT_FAILED');
    }
  } catch (error) {
    await compensateProjectUsage(db, reservation.projectUsageKey);

    throw error;
  }
};

export const releaseAiUsage = async (
  db: D1Database,
  reservation: AiUsageReservation,
): Promise<void> => {
  await releaseUserLease(db, reservation);
};
