import {
  createApiErrorResponse,
  logUnexpectedApiError,
  resolveApiError,
} from '../../shared/http/apiError';

type AppRequestHandler = (
  request: Request,
  env: Env,
  context: ExecutionContext,
) => Response | Promise<Response>;

export const withApiErrorBoundary =
  (handler: AppRequestHandler) =>
  async (
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> => {
    try {
      return await handler(request, env, context);
    } catch (error) {
      const apiError = resolveApiError(error);

      logUnexpectedApiError(apiError, 'Unhandled Worker request error');

      return createApiErrorResponse(apiError);
    }
  };
