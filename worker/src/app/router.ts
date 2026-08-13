import { handleAnalyzeFood } from './routes/analyzeFoodRoute';

import { jsonError, methodNotAllowed } from '../shared/http/jsonResponse';

export const handleRequest = async (
  request: Request,
  env: Env,
  context: ExecutionContext,
): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname === '/') {
    if (request.method !== 'GET') {
      return methodNotAllowed(['GET']);
    }

    return Response.json({
      ok: true,
      service: 'done-ai-worker',
    });
  }

  if (url.pathname === '/v1/analyze-food') {
    if (request.method !== 'POST') {
      return methodNotAllowed(['POST']);
    }

    return handleAnalyzeFood(request, env, context);
  }

  return jsonError('NOT_FOUND', 404);
};
