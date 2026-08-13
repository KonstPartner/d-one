import type { AnalyzeFoodResponse } from '../foodAnalysisResult';

import { FOOD_ANALYSIS_PROMPT_VERSION } from '../foodAnalysisPrompt';

type AnalyzeFoodStage =
  | 'auth'
  | 'request_validation'
  | 'photo_validation'
  | 'usage_reservation'
  | 'provider'
  | 'usage_release';

type AnalyzeFoodD1Outcome =
  | 'not_attempted'
  | 'reserved'
  | 'rejected'
  | 'failed'
  | 'released'
  | 'release_failed';

type AnalyzeFoodLogStatus = 'success' | 'error';

type AnalyzeFoodLogPayload = {
  stage: AnalyzeFoodStage;

  status: AnalyzeFoodLogStatus;

  code?: string;

  analysisStatus?: AnalyzeFoodResponse['status'];

  providerDurationMs?: number;
};

export type AnalyzeFoodTelemetry = {
  requestError: (stage: AnalyzeFoodStage, code: string) => void;

  usageReserved: () => void;

  usageRejected: (code: string) => void;

  usageFailed: (code: string) => void;

  startProvider: () => number;

  providerSuccess: (
    analysisStatus: AnalyzeFoodResponse['status'],
    providerStartedAt: number,
  ) => void;

  providerError: (code: string, providerStartedAt: number) => void;

  usageReleased: () => void;

  usageReleaseFailed: () => void;
};

const shouldLogAsError = (code: string): boolean =>
  code === 'INTERNAL_ERROR' ||
  code === 'AUTH_SERVICE_UNAVAILABLE' ||
  code === 'AI_PROVIDER_ERROR' ||
  code === 'INVALID_AI_RESPONSE' ||
  code === 'AI_TIMEOUT' ||
  code === 'AI_USAGE_RELEASE_FAILED';

export const createAnalyzeFoodTelemetry = (
  model: string,
): AnalyzeFoodTelemetry => {
  const requestId = crypto.randomUUID();

  const requestStartedAt = Date.now();

  let d1Outcome: AnalyzeFoodD1Outcome = 'not_attempted';

  const writeLog = (payload: AnalyzeFoodLogPayload): void => {
    const logEntry = {
      event: 'analyze_food',

      requestId,

      model,

      promptVersion: FOOD_ANALYSIS_PROMPT_VERSION,

      durationMs: Date.now() - requestStartedAt,

      stage: payload.stage,

      status: payload.status,

      d1Outcome,

      ...(payload.code === undefined
        ? {}
        : {
            code: payload.code,
          }),

      ...(payload.analysisStatus === undefined
        ? {}
        : {
            analysisStatus: payload.analysisStatus,
          }),

      ...(payload.providerDurationMs === undefined
        ? {}
        : {
            providerDurationMs: payload.providerDurationMs,
          }),
    };

    if (
      payload.status === 'error' &&
      payload.code !== undefined &&
      shouldLogAsError(payload.code)
    ) {
      console.error(logEntry);

      return;
    }

    console.log(logEntry);
  };

  const requestError = (stage: AnalyzeFoodStage, code: string): void => {
    writeLog({
      stage,
      status: 'error',
      code,
    });
  };

  const usageReserved = (): void => {
    d1Outcome = 'reserved';
  };

  const usageRejected = (code: string): void => {
    d1Outcome = 'rejected';

    writeLog({
      stage: 'usage_reservation',

      status: 'error',

      code,
    });
  };

  const usageFailed = (code: string): void => {
    d1Outcome = 'failed';

    writeLog({
      stage: 'usage_reservation',

      status: 'error',

      code,
    });
  };

  const startProvider = (): number => Date.now();

  const providerSuccess = (
    analysisStatus: AnalyzeFoodResponse['status'],
    providerStartedAt: number,
  ): void => {
    writeLog({
      stage: 'provider',

      status: 'success',

      analysisStatus,

      providerDurationMs: Date.now() - providerStartedAt,
    });
  };

  const providerError = (code: string, providerStartedAt: number): void => {
    writeLog({
      stage: 'provider',

      status: 'error',

      code,

      providerDurationMs: Date.now() - providerStartedAt,
    });
  };

  const usageReleased = (): void => {
    d1Outcome = 'released';

    writeLog({
      stage: 'usage_release',

      status: 'success',
    });
  };

  const usageReleaseFailed = (): void => {
    d1Outcome = 'release_failed';

    writeLog({
      stage: 'usage_release',

      status: 'error',

      code: 'AI_USAGE_RELEASE_FAILED',
    });
  };

  return {
    requestError,

    usageReserved,
    usageRejected,
    usageFailed,

    startProvider,
    providerSuccess,
    providerError,

    usageReleased,
    usageReleaseFailed,
  };
};
