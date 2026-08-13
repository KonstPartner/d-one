import { type AppLanguage, i18n } from '@shared/i18n';

import type { AnalyzeFoodRange, AnalyzeFoodResult } from '../api/analyzeFood';

type SuccessfulAnalyzeFoodResult = Extract<
  AnalyzeFoodResult,
  {
    status: 'ok' | 'partial';
  }
>;

type FixedTranslation = ReturnType<typeof i18n.getFixedT>;

const MAX_AI_ANALYSIS_LENGTH = 2_000;

const formatNumber = (value: number, language: AppLanguage): string =>
  new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  }).format(value);

const formatRange = ({
  range,
  unit,
  language,
  t,
}: {
  range: AnalyzeFoodRange | null;
  unit: 'kcal' | 'gram';
  language: AppLanguage;
  t: FixedTranslation;
}): string => {
  if (range === null) {
    return t('diaryAi.result.couldNotDetermine');
  }

  return t('diaryAi.result.range', {
    min: formatNumber(range.min, language),
    max: formatNumber(range.max, language),
    unit: t(`diaryAi.result.units.${unit}`),
  });
};

const limitAnalysisLength = (value: string): string => {
  if (value.length <= MAX_AI_ANALYSIS_LENGTH) {
    return value;
  }

  return value.slice(0, MAX_AI_ANALYSIS_LENGTH).trimEnd();
};

export const formatAnalyzeFoodResult = (
  result: SuccessfulAnalyzeFoodResult,
  language: AppLanguage
): string => {
  const t = i18n.getFixedT(language);

  const lines = [
    t(`diaryAi.result.${result.status}`),

    t('diaryAi.result.food', {
      value: result.description ?? t('diaryAi.result.couldNotDetermine'),
    }),

    t('diaryAi.result.calories', {
      value: formatRange({
        range: result.caloriesKcal,
        unit: 'kcal',
        language,
        t,
      }),
    }),

    t('diaryAi.result.protein', {
      value: formatRange({
        range: result.proteinGram,
        unit: 'gram',
        language,
        t,
      }),
    }),

    t('diaryAi.result.fat', {
      value: formatRange({
        range: result.fatGram,
        unit: 'gram',
        language,
        t,
      }),
    }),

    t('diaryAi.result.carbohydrates', {
      value: formatRange({
        range: result.carbsGram,
        unit: 'gram',
        language,
        t,
      }),
    }),

    t('diaryAi.result.confidenceLabel', {
      value:
        result.confidence === null
          ? t('diaryAi.result.couldNotDetermine')
          : t(`diaryAi.result.confidence.${result.confidence}`),
    }),
  ];

  if (result.assumptions.length > 0) {
    lines.push(
      t('diaryAi.result.assumptions', {
        value: result.assumptions.join('; '),
      })
    );
  }

  return limitAnalysisLength(lines.join('\n'));
};
