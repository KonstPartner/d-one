import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApiError,
  createApiErrorResponse,
} from '../../../shared/http/apiError';

const { createInteraction } = vi.hoisted(() => ({
  createInteraction: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class GoogleGenAI {
    public readonly interactions = {
      create: createInteraction,
    };
  },
}));

import { analyzeFoodWithGemini } from './geminiClient';

const PHOTO_URL =
  'https://storage.googleapis.com/done.appspot.com/users/user-1/diaryPhotos/entry-1.jpg';

const HIGH_DEMAND_MESSAGE =
  'gemini-3.6-flash is currently experiencing high demand, spikes in demand are usually temporary. Please try again later.';

const params = {
  apiKey: 'test-api-key',
  model: 'gemini-test',
  photoUrl: PHOTO_URL,
  comment: 'Lunch',
  language: 'en' as const,
};

const createUrlContextStep = (url = PHOTO_URL) => ({
  type: 'url_context_result',
  result: [
    {
      status: 'success',
      url,
    },
  ],
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
    createInteraction.mockReset();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('preserves Gemini 503 provider details in the public API error', async () => {
    const providerError = Object.assign(new Error(HIGH_DEMAND_MESSAGE), {
      name: 'ServiceUnavailableError',
      status: 503,
    });

    createInteraction.mockRejectedValueOnce(providerError);

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error).toMatchObject({
      code: 'AI_PROVIDER_ERROR',
      status: 503,
      publicMessage: HIGH_DEMAND_MESSAGE,
      details: {
        reason: 'provider_error',
        provider: {
          status: 503,
          name: 'ServiceUnavailableError',
          message: HIGH_DEMAND_MESSAGE,
        },
      },
    });

    await expectHttpError(error, 503, {
      reason: 'provider_error',
      provider: {
        status: 503,
        name: 'ServiceUnavailableError',
        message: HIGH_DEMAND_MESSAGE,
      },
      code: 'AI_PROVIDER_ERROR',
      message: HIGH_DEMAND_MESSAGE,
    });
  });

  it('reports URL Context failure when Gemini did not confirm the requested photo', async () => {
    createInteraction.mockResolvedValueOnce({
      steps: [createUrlContextStep('https://storage.example/other-photo.jpg')],
      output_text: JSON.stringify({
        status: 'not_food',
      }),
    });

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
    createInteraction.mockResolvedValueOnce({
      steps: [createUrlContextStep()],
    });

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error.code).toBe('INVALID_AI_RESPONSE');
    expect(error.status).toBe(502);
    expect(error.details.reason).toBe('missing_output_text');

    await expectHttpError(error, 502, {
      reason: 'missing_output_text',
      interaction: {
        stepTypes: ['url_context_result'],
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
    createInteraction.mockResolvedValueOnce({
      steps: [createUrlContextStep()],
      output_text: 'not-json',
    });

    const error = await captureApiError(analyzeFoodWithGemini(params));

    expect(error.code).toBe('INVALID_AI_RESPONSE');
    expect(error.status).toBe(502);
    expect(error.details.reason).toBe('invalid_json');

    await expectHttpError(error, 502, {
      reason: 'invalid_json',
      interaction: {
        stepTypes: ['url_context_result'],
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

    createInteraction.mockImplementationOnce(
      async (_request: unknown, options: unknown) =>
        new Promise((_resolve, reject) => {
          const signal = (options as { signal: AbortSignal }).signal;

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

    createInteraction.mockImplementationOnce(async () => {
      order.push('gemini');

      return {
        steps: [createUrlContextStep()],
        output_text: JSON.stringify({
          status: 'not_food',
        }),
      };
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
    expect(createInteraction).not.toHaveBeenCalled();
    expect(error.code).toBe('PROJECT_DAILY_LIMIT_REACHED');
  });

  it('rejects an invalid photo URL without calling Gemini', async () => {
    const error = await captureApiError(
      analyzeFoodWithGemini({
        ...params,
        photoUrl: 'not-a-url',
      }),
    );

    expect(createInteraction).not.toHaveBeenCalled();
    expect(error.code).toBe('IMAGE_NOT_ANALYZABLE');
    expect(error.status).toBe(400);
    expect(error.details.reason).toBe('invalid_photo_url');
  });
});
