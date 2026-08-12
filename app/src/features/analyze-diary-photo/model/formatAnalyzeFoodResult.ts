import type { TFunction } from 'i18next';

import { type AppLanguage, i18n } from '@shared/i18n';

import type { AnalyzeFoodResult } from '../api/analyzeFood';

type SuccessfulAnalyzeFoodResult = Extract<
  AnalyzeFoodResult,
  {
    status: 'ok' | 'partial';
  }
>;

type NumberRange = {
  min: number;
  max: number;
};

const MAX_AI_ANALYSIS_LENGTH = 2_000;

const formatNumber = (value: number, language: AppLanguage): string =>
  new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  }).format(value);

const formatRange = (
  range: NumberRange | null,
  unit: string,
  language: AppLanguage,
  t: TFunction
): string => {
  if (range === null) {
    return t('diary.form.ai.result.couldNotDetermine');
  }

  return t('diary.form.ai.result.range', {
    min: formatNumber(range.min, language),
    max: formatNumber(range.max, language),
    unit,
  });
};

export const formatAnalyzeFoodResult = (
  result: SuccessfulAnalyzeFoodResult,
  language: AppLanguage
): string => {
  const t = i18n.getFixedT(language);

  const lines = [
    t(`diary.form.ai.result.${result.status}`),

    t('diary.form.ai.result.food', {
      value: result.description ?? t('diary.form.ai.result.couldNotDetermine'),
    }),

    t('diary.form.ai.result.calories', {
      value: formatRange(result.caloriesKcal, 'kcal', language, t),
    }),

    t('diary.form.ai.result.protein', {
      value: formatRange(result.proteinGram, 'g', language, t),
    }),

    t('diary.form.ai.result.fat', {
      value: formatRange(result.fatGram, 'g', language, t),
    }),

    t('diary.form.ai.result.carbohydrates', {
      value: formatRange(result.carbsGram, 'g', language, t),
    }),

    t('diary.form.ai.result.confidenceLabel', {
      value:
        result.confidence === null
          ? t('diary.form.ai.result.couldNotDetermine')
          : t(`diary.form.ai.result.confidence.${result.confidence}`),
    }),
  ];

  if (result.assumptions.length > 0) {
    lines.push(
      t('diary.form.ai.result.assumptions', {
        value: result.assumptions.join('; '),
      })
    );
  }

  return lines.join('\n').slice(0, MAX_AI_ANALYSIS_LENGTH);
};
