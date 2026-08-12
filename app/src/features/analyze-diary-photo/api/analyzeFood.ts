import { getFirebaseAppCheckToken } from '@shared/api/firebase';
import { createApiClient } from '@shared/api/http';
import { envConfig } from '@shared/config';
import type { AppLanguage } from '@shared/i18n';

export type AnalyzeFoodRange = {
  min: number;
  max: number;
};

export type AnalyzeFoodResult =
  | {
      status: 'ok' | 'partial';

      description: string | null;

      caloriesKcal: AnalyzeFoodRange | null;

      proteinGram: AnalyzeFoodRange | null;
      fatGram: AnalyzeFoodRange | null;
      carbsGram: AnalyzeFoodRange | null;

      confidence: 'low' | 'medium' | 'high' | null;

      assumptions: string[];
    }
  | {
      status: 'not_food';
    }
  | {
      status: 'insufficient_data';
    };

export type AnalyzeFoodInput = {
  entryId: string;

  photoPath: string;
  photoUrl: string;

  comment: string;

  language: AppLanguage;
};

type WorkerAnalyzeFoodResponse = {
  ok: true;
  data: AnalyzeFoodResult;
};

const apiBaseUrl = envConfig.apiBaseUrl;

if (!apiBaseUrl) {
  throw new Error('Missing config: apiBaseUrl');
}

const aiApiClient = createApiClient({
  baseUrl: apiBaseUrl,
  defaultAuth: true,
});

export const analyzeFood = async ({
  comment,
  ...input
}: AnalyzeFoodInput): Promise<AnalyzeFoodResult> => {
  const appCheckToken = await getFirebaseAppCheckToken();

  const response = await aiApiClient.request<WorkerAnalyzeFoodResponse>(
    '/v1/analyze-food',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-Firebase-AppCheck': appCheckToken,
      },

      body: JSON.stringify({
        ...input,
        comment: comment.slice(0, 1_000),
      }),
    }
  );

  return response.data;
};
