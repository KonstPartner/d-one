import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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
const MAX_PROVIDER_ERROR_BODY_LENGTH = 8_000;

type GeminiProviderError = {
  status: number | null;
  name: string;
  message: string | null;
  body: string | null;
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
  beforeProviderRequest?: () => Promise<void>;
};

const normalizeProviderMessage = (value: string): string | null => {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  return normalized.slice(0, MAX_PROVIDER_ERROR_MESSAGE_LENGTH);
};

const getProviderBody = (error: unknown): string | null => {
  if (error === null || typeof error !== 'object') {
    return null;
  }

  const body = (error as Record<string, unknown>).body;

  if (typeof body !== 'string') {
    return null;
  }

  const normalized = body.trim();

  return normalized.length === 0
    ? null
    : normalized.slice(0, MAX_PROVIDER_ERROR_BODY_LENGTH);
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
  const body = getProviderBody(error);

  if (error instanceof Error) {
    return {
      status,
      name: error.name || 'Error',
      message: normalizeProviderMessage(error.message),
      body,
    };
  }

  return {
    status,
    name: 'UnknownError',
    message: typeof error === 'string' ? normalizeProviderMessage(error) : null,
    body,
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
  beforeProviderRequest,
}: AnalyzeFoodWithGeminiParams): Promise<AnalyzeFoodResponse> => {
  const expectedPhotoUrl = normalizeUrl(photoUrl);

  if (expectedPhotoUrl === null) {
    throw createGeminiError('IMAGE_NOT_ANALYZABLE', 'invalid_photo_url');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const abortController = new AbortController();

  const input = buildFoodAnalysisInput({
    photoUrl,
    comment,
    language,
  });

  await beforeProviderRequest?.();

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const responsePromise = ai.models.generateContent({
      model,

      contents: input,

      config: {
        systemInstruction: FOOD_ANALYSIS_SYSTEM_INSTRUCTION,

        tools: [
          {
            urlContext: {},
          },
        ],

        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },

        responseMimeType: 'application/json',

        responseJsonSchema: foodAnalysisResponseJsonSchema,

        abortSignal: abortController.signal,

        httpOptions: {
          retryOptions: {
            attempts: 1,
          },
        },
      },
    });

    timeoutId = setTimeout(() => {
      abortController.abort();
    }, GEMINI_TIMEOUT_MS);

    const response = await responsePromise;

    const urlMetadata =
      response.candidates?.[0]?.urlContextMetadata?.urlMetadata ?? [];

    let urlContextResultCount = 0;
    let urlContextSuccessCount = 0;
    let matchingPhotoUrlCount = 0;

    for (const result of urlMetadata) {
      urlContextResultCount += 1;

      if (result.urlRetrievalStatus !== 'URL_RETRIEVAL_STATUS_SUCCESS') {
        continue;
      }

      urlContextSuccessCount += 1;

      if (
        typeof result.retrievedUrl === 'string' &&
        normalizeUrl(result.retrievedUrl) === expectedPhotoUrl
      ) {
        matchingPhotoUrlCount += 1;
      }
    }

    const outputText = response.text;

    const interactionDiagnostics: GeminiInteractionDiagnostics = {
      stepTypes: [],
      urlContextResultCount,
      urlContextSuccessCount,
      matchingPhotoUrlCount,
      hasOutputText: typeof outputText === 'string',
      outputTextLength:
        typeof outputText === 'string' ? outputText.length : null,
    };

    if (matchingPhotoUrlCount === 0) {
      throw createGeminiError(
        'IMAGE_NOT_ANALYZABLE',
        'url_context_not_confirmed',
        interactionDiagnostics,
      );
    }

    if (typeof outputText !== 'string') {
      throw createGeminiError(
        'INVALID_AI_RESPONSE',
        'missing_output_text',
        interactionDiagnostics,
      );
    }

    const parseResult = parseAnalyzeFoodResponseDetailed(outputText);

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

    throw new ApiError('AI_PROVIDER_ERROR', {
      details: {
        reason: 'provider_error',
      },
      logDetails: {
        reason: 'provider_error',
        provider: providerError,
      },
      sourceError: error,
    });
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};
