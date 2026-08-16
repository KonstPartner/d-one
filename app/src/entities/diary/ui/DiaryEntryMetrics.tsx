import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryEntryCard';

import { DiaryMetricIcon } from './DiaryMetricIcon';

type DiaryEntryMetricsProps = {
  glucose: number | null;
  carbsGram: number | null;
  shortInsulin: number | null;
  ultraShortInsulin: number | null;
  longInsulin: number | null;
};

export const DiaryEntryMetrics = ({
  glucose,
  carbsGram,
  shortInsulin,
  ultraShortInsulin,
  longInsulin,
}: DiaryEntryMetricsProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const locale = i18n.resolvedLanguage ?? i18n.language;

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const metrics = [
    {
      key: 'glucose',
      value: glucose,
      label: t('diary.entry.metrics.glucose'),
    },
    {
      key: 'carbsGram',
      value: carbsGram,
      label: t('diary.entry.metrics.carbohydrates'),
    },
    {
      key: 'shortInsulin',
      value: shortInsulin,
      label: t('diary.entry.metrics.shortInsulin'),
    },
    {
      key: 'ultraShortInsulin',
      value: ultraShortInsulin,
      label: t('diary.entry.metrics.ultraShortInsulin'),
    },
    {
      key: 'longInsulin',
      value: longInsulin,
      label: t('diary.entry.metrics.longInsulin'),
    },
  ] as const;

  if (metrics.every((metric) => metric.value === null)) {
    return null;
  }

  return (
    <s.Metrics>
      {metrics.map((metric) => {
        if (metric.value === null) {
          return null;
        }

        const value = numberFormatter.format(metric.value);
        const color = theme.colors.metrics[metric.key].text;

        return (
          <s.Metric
            key={metric.key}
            $metric={metric.key}
            accessible
            accessibilityLabel={`${metric.label}: ${value}`}
          >
            <s.MetricIcon>
              <DiaryMetricIcon
                metric={metric.key}
                size={theme.size.xl}
                color={color}
              />
            </s.MetricIcon>

            <s.MetricValue $metric={metric.key}>{value}</s.MetricValue>
          </s.Metric>
        );
      })}
    </s.Metrics>
  );
};
