export const cleanupExpiredAiUsage = async (db: D1Database): Promise<void> => {
  await db
    .prepare(
      `
        DELETE FROM ai_usage
        WHERE substr(usage_key, -10) < date('now', '-30 days')
      `,
    )
    .run();
};
