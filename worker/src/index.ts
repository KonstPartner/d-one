import { withAppCheck } from './app/middleware/withAppCheck';

import { handleRequest } from './app/router';

import { cleanupExpiredAiUsage } from './modules/ai-usage/cleanupAiUsage';

export default {
  fetch: withAppCheck(handleRequest),

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _context: ExecutionContext,
  ): Promise<void> {
    await cleanupExpiredAiUsage(env.AI_USAGE_DB);
  },
} satisfies ExportedHandler<Env>;
