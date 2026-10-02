import {
  type AiUsageReservation,
  releaseAiUsage,
  reserveAiUsage,
} from '../../modules/ai-usage/aiUsage';
import { isAiUsageRejectionCode } from '../../modules/ai-usage/aiUsagePolicy';

import {
  analyzeFoodRequestSchema,
  type AnalyzeFoodRequest,
} from '../../modules/analyze-food/analyzeFoodRequest';

import { analyzeFoodWithGemini } from '../../modules/analyze-food/gemini/geminiClient';

import { createAnalyzeFoodTelemetry } from '../../modules/analyze-food/observability/analyzeFoodTelemetry';

import { validateDiaryPhoto } from '../../modules/analyze-food/photo/validateDiaryPhoto';

import { authorizeUser } from '../../modules/auth/authorizeUser';

import {
  ApiError,
  resolveApiError,
} from '../../shared/http/apiError';

type AnalyzeFoodStage =
  | 'auth'
  | 'request_validation'
  | 'photo_validation'
  | 'usage_reservation'
  | 'provider';

const parseProjectDailyLimit = (value: string): number => {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ApiError('INTERNAL_ERROR');
  }

  return parsed;
};

const parseAnalyzeFoodRequest = async (
  request: Request,
): Promise<AnalyzeFoodRequest> => {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    throw new ApiError('INVALID_REQUEST');
  }

  const parsedRequest = analyzeFoodRequestSchema.safeParse(rawBody);

  if (!parsedRequest.success) {
    throw new ApiError('INVALID_REQUEST');
  }

  return parsedRequest.data;
};

export const handleAnalyzeFood = async (
  request: Request,
  env: Env,
  context: ExecutionContext,
): Promise<Response> => {
  const telemetry = createAnalyzeFoodTelemetry(env.GEMINI_MODEL);

  let stage: AnalyzeFoodStage = 'auth';
  let reservation: AiUsageReservation | null = null;
  let providerStartedAt: number | null = null;

  try {
    const user = await authorizeUser(request, env.FIREBASE_PROJECT_ID);

    stage = 'request_validation';

    const input = await parseAnalyzeFoodRequest(request);

    stage = 'photo_validation';

    const validatedPhoto = await validateDiaryPhoto({
      uid: user.uid,

      entryId: input.entryId,

      photoPath: input.photoPath,

      photoUrl: input.photoUrl,

      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });

    stage = 'usage_reservation';

    reservation = await reserveAiUsage({
      db: env.AI_USAGE_DB,

      uid: user.uid,

      projectDailyLimit: parseProjectDailyLimit(env.AI_PROJECT_DAILY_LIMIT),
    });

    telemetry.usageReserved();

    stage = 'provider';
    providerStartedAt = telemetry.startProvider();

    const analysis = await analyzeFoodWithGemini({
      apiKey: env.GEMINI_API_KEY,

      model: env.GEMINI_MODEL,

      photoUrl: validatedPhoto.url,

      comment: input.comment,

      language: input.language,
    });

    telemetry.providerSuccess(analysis.status, providerStartedAt);

    return Response.json({
      ok: true,

      data: analysis,
    });
  } catch (error) {
    const apiError = resolveApiError(error);
    const code = apiError.code;

    if (stage === 'usage_reservation') {
      if (isAiUsageRejectionCode(code)) {
        telemetry.usageRejected(code);
      } else {
        telemetry.usageFailed(code);
      }
    } else if (stage === 'provider' && providerStartedAt !== null) {
      telemetry.providerError(code, providerStartedAt, apiError.details);
    } else {
      telemetry.requestError(stage, code);
    }

    throw apiError;
  } finally {
    if (reservation !== null) {
      context.waitUntil(
        releaseAiUsage(env.AI_USAGE_DB, reservation)
          .then(() => {
            telemetry.usageReleased();
          })
          .catch(() => {
            telemetry.usageReleaseFailed();
          }),
      );
    }
  }
};
