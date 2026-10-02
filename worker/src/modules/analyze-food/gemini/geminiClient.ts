import { GoogleGenAI } from '@google/genai';

import { ApiError } from '../../../shared/http/apiError';

import type { AnalyzeFoodRequest } from '../analyzeFoodRequest';

import {
  foodAnalysisResponseJsonSchema,
  parseAnalyzeFoodResponseDetailed,
  type AnalyzeFoodResponse,
  type AnalyzeFoodResponseParseFailureReason,
} from '../foodAnalysisResult';

import {
  buildFoodAnalysisInput,
  FOOD_ANALYSIS_SYSTEM_INSTRUCTION,
} from '../foodAnalysisPrompt';

const GEMINI_TIMEOUT_MS = 120_000;
const MAX_PROVIDER_ERROR_MESSAGE_LENGTH = 1_000;

type GeminiProviderError = {
  status: number | null;
  name: string;
  message: string | null;
};

type GeminiAnalysisFailureReason =
  | 'invalid_photo_url'
  | 'url_context_not_confirmed'
  | 'missing_output_text'
  | AnalyzeFoodResponseParseFailureReason
  | 'timeout'
  | 'provider_error';

type GeminiInteractionDiagnostics = {
  stepTypes: string[];
  urlContextResultCount: number;
  urlContextSuccessCount: number;
  matchingPhotoUrlCount: number;
  hasOutputText: boolean;
  outputTextLength: number | null;
};

type AnalyzeFoodWithGeminiParams = Pick<
  AnalyzeFoodRequest,
  'photoUrl' | 'comment' | 'language'
> & {
  apiKey: string;
  model: string;
};

const normalizeProviderMessage = (value: string): string | null => {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  return normalized.slice(0, MAX_PROVIDER_ERROR_MESSAGE_LENGTH);
};

const getProviderStatus = (error: unknown): number | null => {
  if (error === null || typeof error !== 'object') {
    return null;
  }

  const record = error as Record<string, unknown>;

  if (typeof record.status === 'number') {
    return record.status;
  }

  if (typeof record.statusCode === 'number') {
    return record.statusCode;
  }

  return null;
};

const getGeminiProviderError = (error: unknown): GeminiProviderError => {
  const status = getProviderStatus(error);

  if (error instanceof Error) {
    return {
      status,
      name: error.name || 'Error',
      message: normalizeProviderMessage(error.message),
    };
  }

  return {
    status,
    name: 'UnknownError',
    message:
      typeof error === 'string' ? normalizeProviderMessage(error) : null,
  };
};

const createGeminiError = (
  code: 'IMAGE_NOT_ANALYZABLE' | 'INVALID_AI_RESPONSE' | 'AI_TIMEOUT',
  reason: GeminiAnalysisFailureReason,
  interaction?: GeminiInteractionDiagnostics,
): ApiError =>
  new ApiError(code, {
    details: {
      reason,
      ...(interaction === undefined ? {} : { interaction }),
    },
  });

const normalizeUrl = (value: string): string | null => {
  try {
    const url = new URL(value);

    url.hash = '';
    url.searchParams.sort();

    return url.toString();
  } catch {
    return null;
  }
};

export const analyzeFoodWithGemini = async ({
  apiKey,
  model,
  photoUrl,
  comment,
  language,
}: AnalyzeFoodWithGeminiParams): Promise<AnalyzeFoodResponse> => {
  const expectedPhotoUrl = normalizeUrl(photoUrl);

  if (expectedPhotoUrl === null) {
    throw createGeminiError('IMAGE_NOT_ANALYZABLE', 'invalid_photo_url');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const abortController = new AbortController();

  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, GEMINI_TIMEOUT_MS);

  try {
    const interaction = await ai.interactions.create(
      {
        model,

        stream: false,

        store: false,

        system_instruction: FOOD_ANALYSIS_SYSTEM_INSTRUCTION,

        input: buildFoodAnalysisInput({
          photoUrl,
          comment,
          language,
        }),

        tools: [
          {
            type: 'url_context',
          },
        ],

        generation_config: {
          thinking_level: 'low',
        },

        response_format: {
          type: 'text',

          mime_type: 'application/json',

          schema: foodAnalysisResponseJsonSchema,
        },
      },

      {
        retries: {
          strategy: 'none',
        },

        signal: abortController.signal,
      },
    );

    const stepTypes = (interaction.steps ?? []).map((step) => step.type);

    let urlContextResultCount = 0;
    let urlContextSuccessCount = 0;
    let matchingPhotoUrlCount = 0;

    for (const step of interaction.steps ?? []) {
      if (step.type !== 'url_context_result') {
        continue;
      }

      for (const result of step.result) {
        urlContextResultCount += 1;

        if (result.status !== 'success') {
          continue;
        }

        urlContextSuccessCount += 1;

        if (
          typeof result.url === 'string' &&
          normalizeUrl(result.url) === expectedPhotoUrl
        ) {
          matchingPhotoUrlCount += 1;
        }
      }
    }

    const interactionDiagnostics: GeminiInteractionDiagnostics = {
      stepTypes,
      urlContextResultCount,
      urlContextSuccessCount,
      matchingPhotoUrlCount,
      hasOutputText: typeof interaction.output_text === 'string',
      outputTextLength:
        typeof interaction.output_text === 'string'
          ? interaction.output_text.length
          : null,
    };

    if (matchingPhotoUrlCount === 0) {
      throw createGeminiError(
        'IMAGE_NOT_ANALYZABLE',
        'url_context_not_confirmed',
        interactionDiagnostics,
      );
    }

    if (typeof interaction.output_text !== 'string') {
      throw createGeminiError(
        'INVALID_AI_RESPONSE',
        'missing_output_text',
        interactionDiagnostics,
      );
    }

    const parseResult = parseAnalyzeFoodResponseDetailed(
      interaction.output_text,
    );

    if (!parseResult.ok) {
      throw createGeminiError(
        'INVALID_AI_RESPONSE',
        parseResult.reason,
        interactionDiagnostics,
      );
    }

    return parseResult.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (abortController.signal.aborted) {
      throw createGeminiError('AI_TIMEOUT', 'timeout');
    }

    const providerError = getGeminiProviderError(error);

    console.error('Gemini provider request failed', error);

    throw new ApiError('AI_PROVIDER_ERROR', {
      message: providerError.message,
      details: {
        reason: 'provider_error',
        provider: providerError,
      },
      sourceError: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
