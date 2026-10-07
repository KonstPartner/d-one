import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApiError,
  createApiErrorResponse,
} from '../../../shared/http/apiError';

const { generateContent } = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  ThinkingLevel: {
    LOW: 'LOW',
  },
  GoogleGenAI: class GoogleGenAI {
    public readonly models = {
      generateContent,
    };
  },
}));

import { analyzeFoodWithGemini } from './geminiClient';

const PHOTO_URL =
  'https://storage.googleapis.com/done.appspot.com/users/user-1/diaryPhotos/entry-1.jpg';

const PROVIDER_QUOTA_MESSAGE =
  'Your project has exceeded a quota. See https://ai.dev/rate-limit to manage your rate limits.';

const PROVIDER_QUOTA_BODY = JSON.stringify({
  error: {
    code: 429,
    message: PROVIDER_QUOTA_MESSAGE,
    status: 'RESOURCE_EXHAUSTED',
    details: [
      {
        '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
        violations: [
          {
            quotaMetric: 'generativelanguage.googleapis.com/example_quota',
            quotaId: 'ExampleQuotaPerDayPerProject',
          },
        ],
      },
    ],
  },
});

const params = {
  apiKey: 'test-api-key',
  model: 'gemini-test',
  photoUrl: PHOTO_URL,
  comment: 'Lunch',
  language: 'en' as const,
};

const createGenerateContentResponse = (
  text: string | undefined,
  url = PHOTO_URL,
) => ({
  candidates: [
    {
      urlContextMetadata: {
        urlMetadata: [
          {
            retrievedUrl: url,
            urlRetrievalStatus: 'URL_RETRIEVAL_STATUS_SUCCESS',
          },
        ],
      },
    },
  ],
  ...(text === undefined ? {} : { text }),
});

const captureApiError = async (
  promise: Promise<unknown>,
): Promise<ApiError> => {
  try {
    await promise;

    throw new Error('Expected analyzeFoodWithGemini to reject');
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);

    return error as ApiError;
  }
};

const expectHttpError = async (
  error: ApiError,
  status: number,
  body: Record<string, unknown>,
): Promise<void> => {
  const response = createApiErrorResponse(error);

  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: body,
  });
};

describe('analyzeFoodWithGemini error contract', () => {
  beforeEach(() => {
    generateContent.mockReset();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses generateContent with URL Context and structured JSON output', async () => {
    generateContent.mockResolvedValueOnce(
      createGenerateContentResponse(
        JSON.stringify({
          status: 'not_food',
        }),
      ),
    );

    await analyzeFoodWithGemini(params);

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-test',
        contents: expect.stringContaining(PHOTO_URL),
        config: expect.objectContaining({
          systemInstruction: expect.any(String),
          tools: [{ urlContext: {} }],
          thinkingConfig: {
            thinkingLevel: 'LOW',
          },
          responseMimeType: 'application/json',
          responseJsonSchema: expect.any(Object),
          abortSignal: expect.any(AbortSignal),
          httpOptions: {
            retryOptions: {
              attempts: 1,
            },
          },
        }),
      }),
    );
  });

  it('keeps provider diagnostics in logs and out of the public API error', async () => {
    const providerError = Object.assign(new Error(PROVIDER_QUOTA_MESSAGE), {
      name: 'RateLimitError',
      status: 429,
      body: PROVIDER_QUOTA_BODY,
    });

    generateContent.mockRejectedValueOnce(providerError);

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error).toMatchObject({
      code: 'AI_PROVIDER_ERROR',
      status: 503,
      publicMessage: null,
      details: {
        reason: 'provider_error',
      },
      logDetails: {
        reason: 'provider_error',
        provider: {
          status: 429,
          name: 'RateLimitError',
          message: PROVIDER_QUOTA_MESSAGE,
          body: PROVIDER_QUOTA_BODY,
        },
      },
    });

    await expectHttpError(error, 503, {
      reason: 'provider_error',
      code: 'AI_PROVIDER_ERROR',
    });

    expect(console.error).not.toHaveBeenCalled();
  });

  it('reports URL Context failure when Gemini did not confirm the requested photo', async () => {
    generateContent.mockResolvedValueOnce(
      createGenerateContentResponse(
        JSON.stringify({
          status: 'not_food',
        }),
        'https://storage.example/other-photo.jpg',
      ),
    );

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error.code).toBe('IMAGE_NOT_ANALYZABLE');
    expect(error.status).toBe(400);
    expect(error.details).toMatchObject({
      reason: 'url_context_not_confirmed',
      interaction: {
        urlContextResultCount: 1,
        urlContextSuccessCount: 1,
        matchingPhotoUrlCount: 0,
        hasOutputText: true,
      },
    });
  });

  it('reports a missing Gemini output text', async () => {
    generateContent.mockResolvedValueOnce(
      createGenerateContentResponse(undefined),
    );

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error.code).toBe('INVALID_AI_RESPONSE');
    expect(error.status).toBe(502);
    expect(error.details.reason).toBe('missing_output_text');

    await expectHttpError(error, 502, {
      reason: 'missing_output_text',
      interaction: {
        stepTypes: [],
        urlContextResultCount: 1,
        urlContextSuccessCount: 1,
        matchingPhotoUrlCount: 1,
        hasOutputText: false,
        outputTextLength: null,
      },
      code: 'INVALID_AI_RESPONSE',
    });
  });

  it('reports invalid JSON returned by Gemini', async () => {
    generateContent.mockResolvedValueOnce(
      createGenerateContentResponse('not-json'),
    );

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error.code).toBe('INVALID_AI_RESPONSE');
    expect(error.status).toBe(502);
    expect(error.details.reason).toBe('invalid_json');

    await expectHttpError(error, 502, {
      reason: 'invalid_json',
      interaction: {
        stepTypes: [],
        urlContextResultCount: 1,
        urlContextSuccessCount: 1,
        matchingPhotoUrlCount: 1,
        hasOutputText: true,
        outputTextLength: 8,
      },
      code: 'INVALID_AI_RESPONSE',
    });
  });

  it('maps an aborted provider request to AI_TIMEOUT', async () => {
    vi.useFakeTimers();

    generateContent.mockImplementationOnce(
      async (request: unknown) =>
        new Promise((_resolve, reject) => {
          const signal = (
            request as {
              config: {
                abortSignal: AbortSignal;
              };
            }
          ).config.abortSignal;

          signal.addEventListener(
            'abort',
            () => {
              reject(new Error('aborted'));
            },
            {
              once: true,
            },
          );
        }),
    );

    const pendingError = captureApiError(analyzeFoodWithGemini(params));

    await vi.advanceTimersByTimeAsync(120_000);

    const error = await pendingError;

    expect(error.code).toBe('AI_TIMEOUT');
    expect(error.status).toBe(504);
    expect(error.details.reason).toBe('timeout');

    await expectHttpError(error, 504, {
      reason: 'timeout',
      code: 'AI_TIMEOUT',
    });
  });

  it('runs the usage commit immediately before the Gemini request', async () => {
    const order: string[] = [];

    const beforeProviderRequest = vi.fn(async () => {
      order.push('usage');
    });

    generateContent.mockImplementationOnce(async () => {
      order.push('gemini');

      return createGenerateContentResponse(
        JSON.stringify({
          status: 'not_food',
        }),
      );
    });

    await expect(
      analyzeFoodWithGemini({
        ...params,
        beforeProviderRequest,
      }),
    ).resolves.toEqual({
      status: 'not_food',
    });

    expect(order).toEqual(['usage', 'gemini']);
  });

  it('does not call Gemini when the usage commit is rejected', async () => {
    const beforeProviderRequest = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('PROJECT_DAILY_LIMIT_REACHED'));

    const error = await captureApiError(
      analyzeFoodWithGemini({
        ...params,
        beforeProviderRequest,
      }),
    );

    expect(beforeProviderRequest).toHaveBeenCalledTimes(1);
    expect(generateContent).not.toHaveBeenCalled();
    expect(error.code).toBe('PROJECT_DAILY_LIMIT_REACHED');
  });

  it('rejects an invalid photo URL without calling Gemini', async () => {
    const error = await captureApiError(
      analyzeFoodWithGemini({
        ...params,
        photoUrl: 'not-a-url',
      }),
    );

    expect(generateContent).not.toHaveBeenCalled();
    expect(error.code).toBe('IMAGE_NOT_ANALYZABLE');
    expect(error.status).toBe(400);
    expect(error.details.reason).toBe('invalid_photo_url');
  });
});
