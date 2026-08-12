const MAX_CALORIES_KCAL = 20_000;

const MAX_MACRONUTRIENT_GRAM = 5_000;

export type NumberRange = {
  min: number;
  max: number;
};

export type FoodAnalysis = {
  status: 'ok' | 'partial';

  description: string | null;

  caloriesKcal: NumberRange | null;

  proteinGram: NumberRange | null;

  fatGram: NumberRange | null;

  carbsGram: NumberRange | null;

  confidence: 'low' | 'medium' | 'high' | null;

  assumptions: string[];
};

export type AnalyzeFoodResponse =
  | FoodAnalysis
  | {
      status: 'not_food';
    }
  | {
      status: 'insufficient_data';
    };

const numberRangeJsonSchema = {
  type: 'object',

  properties: {
    min: {
      type: 'number',
      minimum: 0,
    },

    max: {
      type: 'number',
      minimum: 0,
    },
  },

  required: ['min', 'max'],

  additionalProperties: false,
};

const nullableRangeJsonSchema = {
  anyOf: [
    numberRangeJsonSchema,

    {
      type: 'null',
    },
  ],
};

export const foodAnalysisResponseJsonSchema: Record<string, unknown> = {
  anyOf: [
    {
      type: 'object',

      properties: {
        status: {
          type: 'string',

          enum: ['ok', 'partial'],
        },

        description: {
          anyOf: [
            {
              type: 'string',
            },

            {
              type: 'null',
            },
          ],
        },

        caloriesKcal: nullableRangeJsonSchema,

        proteinGram: nullableRangeJsonSchema,

        fatGram: nullableRangeJsonSchema,

        carbsGram: nullableRangeJsonSchema,

        confidence: {
          anyOf: [
            {
              type: 'string',

              enum: ['low', 'medium', 'high'],
            },

            {
              type: 'null',
            },
          ],
        },

        assumptions: {
          type: 'array',

          items: {
            type: 'string',
          },
        },
      },

      required: [
        'status',
        'description',
        'caloriesKcal',
        'proteinGram',
        'fatGram',
        'carbsGram',
        'confidence',
        'assumptions',
      ],

      additionalProperties: false,
    },

    {
      type: 'object',

      properties: {
        status: {
          type: 'string',
          enum: ['not_food'],
        },
      },

      required: ['status'],

      additionalProperties: false,
    },

    {
      type: 'object',

      properties: {
        status: {
          type: 'string',

          enum: ['insufficient_data'],
        },
      },

      required: ['status'],

      additionalProperties: false,
    },
  ],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeDescription = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

const sanitizeRange = (value: unknown, maximum: number): NumberRange | null => {
  if (!isRecord(value)) {
    return null;
  }

  const min = value.min;
  const max = value.max;

  if (
    typeof min !== 'number' ||
    typeof max !== 'number' ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 0 ||
    max < 0 ||
    min > max ||
    min > maximum ||
    max > maximum
  ) {
    return null;
  }

  return {
    min,
    max,
  };
};

const sanitizeConfidence = (value: unknown): FoodAnalysis['confidence'] => {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return null;
};

const sanitizeAssumptions = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== 'string') {
      return [];
    }

    const normalized = item.trim();

    return normalized.length > 0 ? [normalized] : [];
  });
};

export const parseAnalyzeFoodResponse = (
  rawText: string,
): AnalyzeFoodResponse | null => {
  let value: unknown;

  try {
    value = JSON.parse(rawText);
  } catch {
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (value.status === 'not_food') {
    return {
      status: 'not_food',
    };
  }

  if (value.status === 'insufficient_data') {
    return {
      status: 'insufficient_data',
    };
  }

  if (value.status !== 'ok' && value.status !== 'partial') {
    return null;
  }

  const description = sanitizeDescription(value.description);

  const caloriesKcal = sanitizeRange(value.caloriesKcal, MAX_CALORIES_KCAL);

  const proteinGram = sanitizeRange(value.proteinGram, MAX_MACRONUTRIENT_GRAM);

  const fatGram = sanitizeRange(value.fatGram, MAX_MACRONUTRIENT_GRAM);

  const carbsGram = sanitizeRange(value.carbsGram, MAX_MACRONUTRIENT_GRAM);

  const confidence = sanitizeConfidence(value.confidence);

  const assumptions = sanitizeAssumptions(value.assumptions);

  const hasUsefulResult =
    description !== null ||
    caloriesKcal !== null ||
    proteinGram !== null ||
    fatGram !== null ||
    carbsGram !== null;

  if (!hasUsefulResult) {
    return null;
  }

  const hasAllPrimaryFields =
    description !== null &&
    caloriesKcal !== null &&
    proteinGram !== null &&
    fatGram !== null &&
    carbsGram !== null;

  return {
    status: value.status === 'ok' && hasAllPrimaryFields ? 'ok' : 'partial',

    description,

    caloriesKcal,

    proteinGram,
    fatGram,
    carbsGram,

    confidence,

    assumptions,
  };
};
