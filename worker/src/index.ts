import { jsonError } from './http/jsonResponse';

export default {
  fetch(request: Request, _env: Env): Response {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return Response.json({
        ok: true,
        service: 'done-ai-worker',
      });
    }

    return jsonError('NOT_FOUND', 404);
  },
} satisfies ExportedHandler<Env>;
