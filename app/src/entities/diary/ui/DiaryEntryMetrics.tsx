import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryEntryCard';

type DiaryEntryMetricsProps = {
  glucose: number | null;
  carbsGram: number | null;
  shortInsulin: number | null;
  longInsulin: number | null;
};

export const DiaryEntryMetrics = ({
  glucose,
  carbsGram,
  shortInsulin,
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
      icon: 'water',
    },
    {
      key: 'carbsGram',
      value: carbsGram,
      label: t('diary.entry.metrics.carbohydrates'),
      icon: 'leaf-outline',
    },
    {
      key: 'shortInsulin',
      value: shortInsulin,
      label: t('diary.entry.metrics.shortInsulin'),
      icon: 'medical-outline',
    },
    {
      key: 'longInsulin',
      value: longInsulin,
      label: t('diary.entry.metrics.longInsulin'),
      icon: 'shield-checkmark-outline',
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

        return (
          <s.Metric
            key={metric.key}
            $metric={metric.key}
            accessible
            accessibilityLabel={`${metric.label}: ${value}`}
          >
            <s.MetricIcon>
              <Ionicons
                name={metric.icon}
                size={theme.size.xl}
                color={theme.colors.metrics[metric.key].text}
              />
            </s.MetricIcon>

            <s.MetricValue $metric={metric.key}>{value}</s.MetricValue>
          </s.Metric>
        );
      })}
    </s.Metrics>
  );
};
