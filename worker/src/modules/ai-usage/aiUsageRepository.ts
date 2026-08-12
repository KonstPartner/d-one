import type { UserUsageSnapshot } from './aiUsagePolicy';

export type AiUsageKeys = {
  userUsageKey: string;
  previousUserUsageKey: string;
  projectUsageKey: string;
};

type TryReserveUserUsageParams = {
  db: D1Database;

  userUsageKey: string;
  previousUserUsageKey: string;

  userDailyLimit: number;

  cooldownThreshold: number;
  nowSeconds: number;
  activeUntil: number;
};

type ReservationReference = {
  userUsageKey: string;
  activeUntil: number;
};

export const createAiUsageKeys = (
  uid: string,
  day: string,
  previousDay: string,
): AiUsageKeys => ({
  userUsageKey: `user:${uid}:${day}`,

  previousUserUsageKey: `user:${uid}:${previousDay}`,

  projectUsageKey: `project:${day}`,
});

export const ensureUsageRows = async (
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

export const tryReserveUserUsage = async ({
  db,

  userUsageKey,
  previousUserUsageKey,

  userDailyLimit,

  cooldownThreshold,
  nowSeconds,
  activeUntil,
}: TryReserveUserUsageParams): Promise<boolean> => {
  const result = await db
    .prepare(
      `
          UPDATE ai_usage

          SET
            request_count =
              request_count + 1,

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
      userDailyLimit,
      cooldownThreshold,
      nowSeconds,
      previousUserUsageKey,
      cooldownThreshold,
      nowSeconds,
    )
    .run();

  return result.meta.changes === 1;
};

export const getUserUsageSnapshot = async (
  db: D1Database,
  userUsageKey: string,
  previousUserUsageKey: string,
): Promise<UserUsageSnapshot | null> =>
  db
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

export const compensateUserReservation = async (
  db: D1Database,
  reservation: ReservationReference,
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

export const tryReserveProjectUsage = async (
  db: D1Database,
  projectUsageKey: string,
  projectDailyLimit: number,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `
          UPDATE ai_usage

          SET
            request_count =
              request_count + 1

          WHERE usage_key = ?
            AND request_count < ?
        `,
    )
    .bind(projectUsageKey, projectDailyLimit)
    .run();

  return result.meta.changes === 1;
};

export const finalizeUserReservation = async (
  db: D1Database,
  reservation: ReservationReference & {
    reservedAt: number;
  },
): Promise<boolean> => {
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

  return result.meta.changes === 1;
};

export const releaseUserLease = async (
  db: D1Database,
  reservation: ReservationReference,
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
