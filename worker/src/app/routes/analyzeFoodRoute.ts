import {
  AuthorizeUserError,
  authorizeUser,
} from '../../modules/auth/authorizeUser';

import {
  AiUsageLimitError,
  releaseAiUsage,
  reserveAiUsage,
} from '../../modules/ai-usage/aiUsage';

import { analyzeFoodRequestSchema } from '../../modules/analyze-food/analyzeFoodRequest';

import {
  GeminiAnalysisError,
  analyzeFoodWithGemini,
} from '../../modules/analyze-food/gemini/geminiClient';

import {
  PhotoValidationError,
  validateDiaryPhoto,
} from '../../modules/analyze-food/photo/validateDiaryPhoto';

import { jsonError } from '../../shared/http/jsonResponse';

const parseProjectDailyLimit = (value: string): number | null => {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const createAuthorizeUserErrorResponse = (
  error: AuthorizeUserError,
): Response => {
  switch (error.code) {
    case 'UNAUTHORIZED':
      return jsonError('UNAUTHORIZED', 401);

    case 'EMAIL_NOT_VERIFIED':
      return jsonError('EMAIL_NOT_VERIFIED', 403);

    case 'FORBIDDEN_ROLE':
      return jsonError('FORBIDDEN_ROLE', 403);

    case 'USER_PROFILE_NOT_FOUND':
      return jsonError('USER_PROFILE_NOT_FOUND', 404);

    case 'INVALID_USER_PROFILE':
    case 'AUTH_SERVICE_UNAVAILABLE':
      return jsonError('AUTH_SERVICE_UNAVAILABLE', 503);
  }
};

const createPhotoValidationErrorResponse = (
  error: PhotoValidationError,
): Response => {
  switch (error.code) {
    case 'INVALID_IMAGE_URL':
      return jsonError('INVALID_IMAGE_URL', 400);

    case 'IMAGE_NOT_ANALYZABLE':
      return jsonError('IMAGE_NOT_ANALYZABLE', 400);

    case 'IMAGE_TOO_LARGE':
      return jsonError('IMAGE_TOO_LARGE', 413);
  }
};

const createAiUsageErrorResponse = (error: AiUsageLimitError): Response => {
  switch (error.code) {
    case 'AI_REQUEST_ALREADY_ACTIVE':
      return jsonError('AI_REQUEST_ALREADY_ACTIVE', 409);

    case 'USER_DAILY_LIMIT_REACHED':
      return jsonError('USER_DAILY_LIMIT_REACHED', 429);

    case 'PROJECT_DAILY_LIMIT_REACHED':
      return jsonError('PROJECT_DAILY_LIMIT_REACHED', 429);

    case 'REQUEST_TOO_FREQUENT':
      return jsonError('REQUEST_TOO_FREQUENT', 429);
  }
};

const createGeminiErrorResponse = (error: GeminiAnalysisError): Response => {
  switch (error.code) {
    case 'IMAGE_NOT_ANALYZABLE':
      return jsonError('IMAGE_NOT_ANALYZABLE', 400);

    case 'AI_PROVIDER_ERROR':
      return jsonError('AI_PROVIDER_ERROR', 502);

    case 'INVALID_AI_RESPONSE':
      return jsonError('INVALID_AI_RESPONSE', 502);

    case 'AI_TIMEOUT':
      return jsonError('AI_TIMEOUT', 504);
  }
};

export const handleAnalyzeFood = async (
  request: Request,
  env: Env,
  context: ExecutionContext,
): Promise<Response> => {
  let uid: string;

  try {
    const user = await authorizeUser(request, env.FIREBASE_PROJECT_ID);

    uid = user.uid;
  } catch (error) {
    if (error instanceof AuthorizeUserError) {
      return createAuthorizeUserErrorResponse(error);
    }

    return jsonError('INTERNAL_ERROR', 500);
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return jsonError('INVALID_REQUEST', 400);
  }

  const parsedRequest = analyzeFoodRequestSchema.safeParse(rawBody);

  if (!parsedRequest.success) {
    return jsonError('INVALID_REQUEST', 400);
  }

  const input = parsedRequest.data;

  let validatedPhoto;

  try {
    validatedPhoto = await validateDiaryPhoto({
      uid,

      entryId: input.entryId,

      photoPath: input.photoPath,

      photoUrl: input.photoUrl,

      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    if (error instanceof PhotoValidationError) {
      return createPhotoValidationErrorResponse(error);
    }

    return jsonError('INTERNAL_ERROR', 500);
  }

  const projectDailyLimit = parseProjectDailyLimit(env.AI_PROJECT_DAILY_LIMIT);

  if (projectDailyLimit === null) {
    return jsonError('INTERNAL_ERROR', 500);
  }

  let reservation;

  try {
    reservation = await reserveAiUsage({
      db: env.AI_USAGE_DB,

      uid,

      projectDailyLimit,
    });
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return createAiUsageErrorResponse(error);
    }

    return jsonError('INTERNAL_ERROR', 500);
  }

  try {
    const analysis = await analyzeFoodWithGemini({
      apiKey: env.GEMINI_API_KEY,

      model: env.GEMINI_MODEL,

      photoUrl: validatedPhoto.url,

      comment: input.comment,

      language: input.language,
    });

    return Response.json({
      ok: true,
      data: analysis,
    });
  } catch (error) {
    if (error instanceof GeminiAnalysisError) {
      return createGeminiErrorResponse(error);
    }

    return jsonError('INTERNAL_ERROR', 500);
  } finally {
    context.waitUntil(releaseAiUsage(env.AI_USAGE_DB, reservation));
  }
};
