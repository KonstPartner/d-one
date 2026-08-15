import { useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import type { DiaryExportScope } from '@features/export-diary';
import type { DiaryFilterDateRange } from '@features/filter-diary-entries';
import * as ss from '@shared/styles';
import { Button, Spinner } from '@shared/ui';

import { useDiaryExportPeriodStats } from '../model/useDiaryExportScopeStats';
import * as s from '../styles/DiaryTransferModal';

import { ExportPeriodDateRangePicker } from './ExportPeriodDateRangePicker';

type ExportPeriodScreenProps = {
  disabled: boolean;

  onExport: (
    scope: Extract<DiaryExportScope, { type: 'period' }>
  ) => void | Promise<void>;
};

type ExportPeriod = {
  from: Date;
  to: Date;
};

const createInitialDateRange = (): DiaryFilterDateRange => ({
  from: null,
  to: null,
  activeBoundary: 'from',
});

const parseDateKeyToLocalDate = (
  dateKey: string,
  boundary: 'start' | 'end'
): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (boundary === 'start') {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const createExportPeriod = (
  dateRange: DiaryFilterDateRange
): ExportPeriod | null => {
  if (dateRange.from === null || dateRange.to === null) {
    return null;
  }

  return {
    from: parseDateKeyToLocalDate(dateRange.from, 'start'),

    to: parseDateKeyToLocalDate(dateRange.to, 'end'),
  };
};

export const ExportPeriodScreen = ({
  disabled,
  onExport,
}: ExportPeriodScreenProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [dateRange, setDateRange] = useState<DiaryFilterDateRange>(
    createInitialDateRange
  );

  const period = useMemo(() => createExportPeriod(dateRange), [dateRange]);

  const { stats, isFetching, error } = useDiaryExportPeriodStats(period);

  const canExport =
    !disabled &&
    period !== null &&
    !isFetching &&
    error === null &&
    stats !== null &&
    stats.entriesCount > 0;

  const handleExport = (): void => {
    if (!canExport || period === null) {
      return;
    }

    void onExport({
      type: 'period',
      from: period.from,
      to: period.to,
    });
  };

  return (
    <s.Options>
      <ExportPeriodDateRangePicker
        value={dateRange}
        disabled={disabled}
        onChange={setDateRange}
      />

      {period !== null && (
        <s.OptionContent>
          {isFetching ? (
            <Spinner size={20} />
          ) : error !== null ? (
            <s.OptionDescription>
              {t('transfer.export.errors.failed')}
            </s.OptionDescription>
          ) : (
            <s.OptionDescription>
              {t('transfer.export.result.entries')}
              {': '}
              {stats?.entriesCount ?? 0}
            </s.OptionDescription>
          )}
        </s.OptionContent>
      )}

      <Button tone="input" disabled={!canExport} onPress={handleExport}>
        <s.OptionTitle style={ss.Text(theme)}>
          {t('transfer.actions.export')}
        </s.OptionTitle>
      </Button>
    </s.Options>
  );
};
