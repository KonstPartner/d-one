import {
  type AppCheckContext,
  withAppCheck,
} from './app/middleware/withAppCheck';

import { jsonError } from './shared/http/jsonResponse';

const handleRequest = (
  request: Request,
  _env: Env,
  _context: ExecutionContext,
  _appCheckContext: AppCheckContext,
): Response => {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/') {
    return Response.json({
      ok: true,
      service: 'done-ai-worker',
    });
  }

  return jsonError('NOT_FOUND', 404);
};

export default {
  fetch: withAppCheck(handleRequest),
} satisfies ExportedHandler<Env>;
