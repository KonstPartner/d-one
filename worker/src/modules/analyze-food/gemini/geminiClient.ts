import { GoogleGenAI } from '@google/genai';

import type { AnalyzeFoodRequest } from '../analyzeFoodRequest';

import {
  foodAnalysisResponseJsonSchema,
  parseAnalyzeFoodResponse,
  type AnalyzeFoodResponse,
} from '../foodAnalysisResult';

import {
  buildFoodAnalysisContext,
  FOOD_ANALYSIS_SYSTEM_INSTRUCTION,
} from '../foodAnalysisPrompt';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const GEMINI_TIMEOUT_MS = 45_000;

export type GeminiAnalysisErrorCode =
  | 'IMAGE_NOT_ANALYZABLE'
  | 'IMAGE_TOO_LARGE'
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

const normalizeContentType = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  return value.split(';')[0]?.trim().toLowerCase() ?? null;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  const chunkSize = 32_768;

  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const downloadJpegAsBase64 = async (photoUrl: string): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(photoUrl, {
      method: 'GET',
      redirect: 'error',
    });
  } catch {
    throw new GeminiAnalysisError('IMAGE_NOT_ANALYZABLE');
  }

  if (!response.ok) {
    throw new GeminiAnalysisError('IMAGE_NOT_ANALYZABLE');
  }

  const contentType = normalizeContentType(
    response.headers.get('content-type'),
  );

  if (contentType !== 'image/jpeg') {
    throw new GeminiAnalysisError('IMAGE_NOT_ANALYZABLE');
  }

  const contentLengthHeader = response.headers.get('content-length');

  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_IMAGE_SIZE_BYTES
    ) {
      throw new GeminiAnalysisError('IMAGE_TOO_LARGE');
    }
  }

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new GeminiAnalysisError('IMAGE_TOO_LARGE');
  }

  return arrayBufferToBase64(buffer);
};

export const analyzeFoodWithGemini = async ({
  apiKey,
  model,
  photoUrl,
  comment,
  language,
}: AnalyzeFoodWithGeminiParams): Promise<AnalyzeFoodResponse> => {
  const imageData = await downloadJpegAsBase64(photoUrl);

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

        system_instruction: FOOD_ANALYSIS_SYSTEM_INSTRUCTION,

        input: [
          {
            type: 'text',

            text: buildFoodAnalysisContext({
              comment,
              language,
            }),
          },

          {
            type: 'image',
            data: imageData,
            mime_type: 'image/jpeg',
          },
        ],

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
