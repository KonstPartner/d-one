import {
  getAppCheckToken,
  verifyFirebaseAppCheckToken,
} from '../../shared/security/firebaseAppCheck';

type AppRequestHandler = (
  request: Request,
  env: Env,
  context: ExecutionContext,
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

export const withAppCheck =
  (handler: AppRequestHandler) =>
  async (
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> => {
    if (!isLocalDiagnosticsRequest(request, env)) {
      const token = getAppCheckToken(request);

      await verifyFirebaseAppCheckToken({
        token,

        projectNumber: env.FIREBASE_PROJECT_NUMBER,

        allowedAppIds: [env.FIREBASE_ANDROID_APP_ID, env.FIREBASE_IOS_APP_ID],
      });
    }

    return handler(request, env, context);
  };
