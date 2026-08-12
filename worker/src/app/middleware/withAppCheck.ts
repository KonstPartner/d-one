import {
  FirebaseAppCheckError,
  getAppCheckToken,
  verifyFirebaseAppCheckToken,
  type VerifiedFirebaseApp,
} from '../../shared/security/firebaseAppCheck';

import { jsonError } from '../../shared/http/jsonResponse';

export type AppCheckContext = {
  app: VerifiedFirebaseApp;
};

type AppRequestHandler = (
  request: Request,
  env: Env,
  context: ExecutionContext,
  appCheckContext: AppCheckContext,
) => Response | Promise<Response>;

type LocalDiagnosticsEnv = Env & {
  LOCAL_DIAGNOSTICS?: string;
};

const LOCAL_DIAGNOSTIC_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
]);

export const isLocalDiagnosticsRequest = (
  request: Request,
  env: Env,
): boolean => {
  const hostname = new URL(request.url).hostname;

  const localEnv = env as LocalDiagnosticsEnv;

  return (
    localEnv.LOCAL_DIAGNOSTICS === 'true' &&
    LOCAL_DIAGNOSTIC_HOSTS.has(hostname)
  );
};

const createAppCheckErrorResponse = (
  error: FirebaseAppCheckError,
): Response => {
  switch (error.code) {
    case 'APP_CHECK_REQUIRED':
    case 'INVALID_APP_CHECK_TOKEN':
      return jsonError(error.code, 401);

    case 'APP_NOT_ALLOWED':
      return jsonError(error.code, 403);

    case 'APP_CHECK_SERVICE_UNAVAILABLE':
      return jsonError(error.code, 503);
  }
};

export const withAppCheck =
  (handler: AppRequestHandler) =>
  async (
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> => {
    if (isLocalDiagnosticsRequest(request, env)) {
      return handler(request, env, context, {
        app: {
          appId: 'local-diagnostics',
        },
      });
    }

    try {
      const token = getAppCheckToken(request);

      const app = await verifyFirebaseAppCheckToken({
        token,

        projectNumber: env.FIREBASE_PROJECT_NUMBER,

        allowedAppIds: [env.FIREBASE_ANDROID_APP_ID, env.FIREBASE_IOS_APP_ID],
      });

      return await handler(request, env, context, {
        app,
      });
    } catch (error) {
      if (error instanceof FirebaseAppCheckError) {
        return createAppCheckErrorResponse(error);
      }

      return jsonError('INTERNAL_ERROR', 500);
    }
  };
