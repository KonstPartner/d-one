import i18n from 'i18next';

import { createApiClient } from '@shared/api/http/createApiClient';
import commonRu from '@shared/i18n/resources/common/ru.json';

import { ApiError } from '../apiError';
import { errorMapper } from '../errorMapper';

jest.mock('@shared/api/firebase/getAuthToken', () => ({
  getAuthToken: jest.fn(),
}));

const CLOUDFLARE_MESSAGE =
  'The origin web server returned an invalid or incomplete response to Cloudflare. This typically indicates the origin is overloaded or misconfigured.';

const mockFetch = jest.fn();

const api = createApiClient({
  baseUrl: 'https://api.example',
});

const rejectWithResponse = async ({
  status,
  body,
}: {
  status: number;
  body: string;
}): Promise<ApiError> => {
  mockFetch.mockResolvedValueOnce({
    status,
    ok: false,
    text: async () => body,
  } as Response);

  try {
    await api.get('/v1/analyze-food');

    throw new Error('Expected API request to fail');
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);

    return error as ApiError;
  }
};

describe('AI API error pipeline', () => {
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await i18n.init({
      resources: {
        ru: {
          translation: commonRu,
        },
      },
      lng: 'ru',
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
    });

    global.fetch = mockFetch as unknown as typeof fetch;
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('localizes provider errors without exposing provider diagnostics', async () => {
    const error = await rejectWithResponse({
      status: 503,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'AI_PROVIDER_ERROR',
          reason: 'provider_error',
        },
      }),
    });

    expect(error.status).toBe(503);
    expect(error.message).toBe('Request failed with status 503');
    expect(errorMapper(error, 'api')).toBe(
      'AI-анализ временно недоступен. Повторите позже.'
    );
  });

  it('maps a known Gemini response reason to localized text', async () => {
    const error = await rejectWithResponse({
      status: 502,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'INVALID_AI_RESPONSE',
          reason: 'missing_output_text',
        },
      }),
    });

    expect(errorMapper(error, 'api')).toBe(
      'Gemini вернул ответ без текста анализа.'
    );
  });

  it('preserves an unknown structured API message', async () => {
    const error = await rejectWithResponse({
      status: 503,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'SOMETHING_NEW',
          message: 'A new provider failure that the app does not know yet.',
        },
      }),
    });

    expect(errorMapper(error, 'api')).toBe('Произошла неизвестная ошибка');
  });

  it('preserves a plain-text Cloudflare response', async () => {
    const error = await rejectWithResponse({
      status: 502,
      body: CLOUDFLARE_MESSAGE,
    });

    expect(error.message).toBe(CLOUDFLARE_MESSAGE);
    expect(errorMapper(error, 'api')).toBe(
      'Произошла ошибка сети. Проверьте подключение и повторите попытку.'
    );
  });

  it('preserves an INTERNAL_ERROR message returned by the Worker', async () => {
    const error = await rejectWithResponse({
      status: 500,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Specific unexpected server failure',
        },
      }),
    });

    expect(errorMapper(error, 'api')).toBe('Произошла неизвестная ошибка');
  });

  it('localizes a known usage-limit code without requiring a provider call', async () => {
    const error = await rejectWithResponse({
      status: 429,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'USER_DAILY_LIMIT_REACHED',
        },
      }),
    });

    expect(errorMapper(error, 'api')).toBe(
      'Дневной лимит AI-анализов исчерпан.'
    );
  });
});
