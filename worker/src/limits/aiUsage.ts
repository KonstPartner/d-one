const USER_DAILY_LIMIT = 5;
const REQUEST_COOLDOWN_SECONDS = 30;
const ACTIVE_LEASE_SECONDS = 90;

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

export type AiUsageReservation = {
  userUsageKey: string;
  projectUsageKey: string;
  reservedAt: number;
  activeUntil: number;
};

type UserUsageSnapshot = {
  request_count: number;
  latest_last_request_at: number | null;
  latest_active_until: number | null;
};

type ReserveAiUsageParams = {
  db: D1Database;
  uid: string;
  projectDailyLimit: number;
  now?: Date;
};

const getUtcDay = (date: Date): string => date.toISOString().slice(0, 10);

const getPreviousUtcDay = (date: Date): string => {
  const previousDay = new Date(date);

  previousDay.setUTCDate(previousDay.getUTCDate() - 1);

  return getUtcDay(previousDay);
};

const createUserUsageKey = (uid: string, day: string): string =>
  `user:${uid}:${day}`;

const createProjectUsageKey = (day: string): string => `project:${day}`;

const assertProjectDailyLimit = (value: number): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error('INVALID_AI_PROJECT_DAILY_LIMIT');
  }
};

const insertUsageRows = async (
  db: D1Database,
  userUsageKey: string,
  projectUsageKey: string,
): Promise<void> => {
  await db.batch([
    db
      .prepare(
        `
          INSERT OR IGNORE INTO ai_usage (
            usage_key,
            request_count,
            last_request_at,
            active_until
          )
          VALUES (?, 0, NULL, NULL)
        `,
      )
      .bind(userUsageKey),

    db
      .prepare(
        `
          INSERT OR IGNORE INTO ai_usage (
            usage_key,
            request_count,
            last_request_at,
            active_until
          )
          VALUES (?, 0, NULL, NULL)
        `,
      )
      .bind(projectUsageKey),
  ]);
};

const getUserLimitError = async (
  db: D1Database,
  userUsageKey: string,
  previousUserUsageKey: string,
  nowSeconds: number,
  cooldownThreshold: number,
): Promise<AiUsageLimitError> => {
  const snapshot = await db
    .prepare(
      `
        SELECT
          COALESCE(
            MAX(
              CASE
                WHEN usage_key = ?
                THEN request_count
                ELSE NULL
              END
            ),
            0
          ) AS request_count,

          MAX(last_request_at)
            AS latest_last_request_at,

          MAX(active_until)
            AS latest_active_until

        FROM ai_usage

        WHERE usage_key IN (?, ?)
      `,
    )
    .bind(userUsageKey, userUsageKey, previousUserUsageKey)
    .first<UserUsageSnapshot>();

  if (snapshot === null) {
    throw new Error('AI_USAGE_STATE_NOT_FOUND');
  }

  if (
    snapshot.latest_active_until !== null &&
    snapshot.latest_active_until > nowSeconds
  ) {
    return new AiUsageLimitError('AI_REQUEST_ALREADY_ACTIVE');
  }

  if (snapshot.request_count >= USER_DAILY_LIMIT) {
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

const reserveUserUsage = async (
  db: D1Database,
  userUsageKey: string,
  previousUserUsageKey: string,
  nowSeconds: number,
  activeUntil: number,
): Promise<void> => {
  const cooldownThreshold = nowSeconds - REQUEST_COOLDOWN_SECONDS;

  const result = await db
    .prepare(
      `
        UPDATE ai_usage

        SET
          request_count = request_count + 1,
          active_until = ?

        WHERE usage_key = ?

          AND request_count < ?

          AND (
            last_request_at IS NULL
            OR last_request_at <= ?
          )

          AND (
            active_until IS NULL
            OR active_until <= ?
          )

          AND NOT EXISTS (
            SELECT 1

            FROM ai_usage

            WHERE usage_key = ?

              AND (
                (
                  last_request_at IS NOT NULL
                  AND last_request_at > ?
                )

                OR

                (
                  active_until IS NOT NULL
                  AND active_until > ?
                )
              )
          )
      `,
    )
    .bind(
      activeUntil,
      userUsageKey,
      USER_DAILY_LIMIT,
      cooldownThreshold,
      nowSeconds,
      previousUserUsageKey,
      cooldownThreshold,
      nowSeconds,
    )
    .run();

  if (result.meta.changes === 1) {
    return;
  }

  throw await getUserLimitError(
    db,
    userUsageKey,
    previousUserUsageKey,
    nowSeconds,
    cooldownThreshold,
  );
};

const compensateUserReservation = async (
  db: D1Database,
  reservation: AiUsageReservation,
): Promise<void> => {
  await db
    .prepare(
      `
        UPDATE ai_usage

        SET
          request_count =
            CASE
              WHEN request_count > 0
              THEN request_count - 1
              ELSE 0
            END,

          active_until = NULL

        WHERE usage_key = ?
          AND active_until = ?
      `,
    )
    .bind(reservation.userUsageKey, reservation.activeUntil)
    .run();
};

const reserveProjectUsage = async (
  db: D1Database,
  projectUsageKey: string,
  projectDailyLimit: number,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `
        UPDATE ai_usage

        SET
          request_count = request_count + 1

        WHERE usage_key = ?
          AND request_count < ?
      `,
    )
    .bind(projectUsageKey, projectDailyLimit)
    .run();

  return result.meta.changes === 1;
};

const finalizeUserReservation = async (
  db: D1Database,
  reservation: AiUsageReservation,
): Promise<void> => {
  const result = await db
    .prepare(
      `
        UPDATE ai_usage

        SET last_request_at = ?

        WHERE usage_key = ?
          AND active_until = ?
      `,
    )
    .bind(
      reservation.reservedAt,
      reservation.userUsageKey,
      reservation.activeUntil,
    )
    .run();

  if (result.meta.changes !== 1) {
    throw new Error('AI_USAGE_RESERVATION_FINALIZE_FAILED');
  }
};

export const reserveAiUsage = async ({
  db,
  uid,
  projectDailyLimit,
  now = new Date(),
}: ReserveAiUsageParams): Promise<AiUsageReservation> => {
  assertProjectDailyLimit(projectDailyLimit);

  const nowSeconds = Math.floor(now.getTime() / 1000);

  const day = getUtcDay(now);
  const previousDay = getPreviousUtcDay(now);

  const userUsageKey = createUserUsageKey(uid, day);

  const previousUserUsageKey = createUserUsageKey(uid, previousDay);

  const projectUsageKey = createProjectUsageKey(day);

  const activeUntil = nowSeconds + ACTIVE_LEASE_SECONDS;

  await insertUsageRows(db, userUsageKey, projectUsageKey);

  await reserveUserUsage(
    db,
    userUsageKey,
    previousUserUsageKey,
    nowSeconds,
    activeUntil,
  );

  const reservation: AiUsageReservation = {
    userUsageKey,
    projectUsageKey,
    reservedAt: nowSeconds,
    activeUntil,
  };

  let projectReserved: boolean;

  try {
    projectReserved = await reserveProjectUsage(
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

  await finalizeUserReservation(db, reservation);

  return reservation;
};

export const releaseAiUsage = async (
  db: D1Database,
  reservation: AiUsageReservation,
): Promise<void> => {
  await db
    .prepare(
      `
        UPDATE ai_usage

        SET active_until = NULL

        WHERE usage_key = ?
          AND active_until = ?
      `,
    )
    .bind(reservation.userUsageKey, reservation.activeUntil)
    .run();
};
