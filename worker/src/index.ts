import {
  type AppCheckRequestContext,
  withFirebaseAppCheck,
} from './auth/withFirebaseAppCheck';

import { jsonError } from './http/jsonResponse';

const handleRequest = (
  request: Request,
  _env: Env,
  _context: ExecutionContext,
  _appCheckContext: AppCheckRequestContext,
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
  fetch: withFirebaseAppCheck(handleRequest),
} satisfies ExportedHandler<Env>;
