import { GoogleGenAI } from '@google/genai';

import type { AnalyzeFoodRequest } from '../analyzeFoodRequest';

import {
  foodAnalysisResponseJsonSchema,
  parseAnalyzeFoodResponse,
  type AnalyzeFoodResponse,
} from '../foodAnalysisResult';

import {
  buildFoodAnalysisInput,
  FOOD_ANALYSIS_SYSTEM_INSTRUCTION,
} from '../foodAnalysisPrompt';

const GEMINI_TIMEOUT_MS = 120_000;

export type GeminiAnalysisErrorCode =
  | 'IMAGE_NOT_ANALYZABLE'
  | 'AI_PROVIDER_ERROR'
  | 'INVALID_AI_RESPONSE'
  | 'AI_TIMEOUT';

export class GeminiAnalysisError extends Error {
  public constructor(public readonly code: GeminiAnalysisErrorCode) {
    super(code);
    this.name = 'GeminiAnalysisError';
  }
}

type AnalyzeFoodWithGeminiParams = Pick<
  AnalyzeFoodRequest,
  'photoUrl' | 'comment' | 'language'
> & {
  apiKey: string;
  model: string;
};

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
    throw new GeminiAnalysisError('IMAGE_NOT_ANALYZABLE');
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

    const photoRetrieved = (interaction.steps ?? []).some((step) => {
      if (step.type !== 'url_context_result') {
        return false;
      }

      return step.result.some((result) => {
        if (result.status !== 'success' || typeof result.url !== 'string') {
          return false;
        }

        return normalizeUrl(result.url) === expectedPhotoUrl;
      });
    });

    if (!photoRetrieved) {
      throw new GeminiAnalysisError('IMAGE_NOT_ANALYZABLE');
    }

    if (typeof interaction.output_text !== 'string') {
      throw new GeminiAnalysisError('INVALID_AI_RESPONSE');
    }

    const analysis = parseAnalyzeFoodResponse(interaction.output_text);

    if (analysis === null) {
      throw new GeminiAnalysisError('INVALID_AI_RESPONSE');
    }

    return analysis;
  } catch (error) {
    if (error instanceof GeminiAnalysisError) {
      throw error;
    }

    if (abortController.signal.aborted) {
      throw new GeminiAnalysisError('AI_TIMEOUT');
    }

    throw new GeminiAnalysisError('AI_PROVIDER_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};
