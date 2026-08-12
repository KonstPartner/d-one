import {
  FirebaseAppCheckError,
  getAppCheckToken,
  verifyFirebaseAppCheckToken,
  type VerifiedFirebaseApp,
} from './firebaseAppCheck';

import { jsonError } from '../http/jsonResponse';

export type AppCheckRequestContext = {
  app: VerifiedFirebaseApp;
};

type ProtectedRequestHandler = (
  request: Request,
  env: Env,
  context: ExecutionContext,
  appCheckContext: AppCheckRequestContext,
) => Response | Promise<Response>;

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

export const withFirebaseAppCheck =
  (handler: ProtectedRequestHandler) =>
  async (
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> => {
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
