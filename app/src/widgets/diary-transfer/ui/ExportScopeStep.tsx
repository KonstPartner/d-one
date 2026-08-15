import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DiaryExportFormat } from '@features/export-diary';
import { ConfirmDialog } from '@shared/ui';

import {
  type DiaryExportScopeStats,
  useDiaryExportAllStats,
} from '../model/useDiaryExportScopeStats';
import * as s from '../styles/DiaryTransferModal';

import {
  TransferStepHeader,
  TransferStepOption,
} from './TransferStepPrimitives';

type ExportScopeStepProps = {
  format: DiaryExportFormat;

  disabled: boolean;
  allDisabled: boolean;

  onBack: () => void;

  onExportAll: () => void;
  onSelectPeriod: () => void;
  onSelectEntries: () => void;
};

const getFormatTitleKey = (
  format: DiaryExportFormat
):
  | 'transfer.export.fullBackup'
  | 'transfer.export.lightweightBackup'
  | 'transfer.export.csv' => {
  switch (format) {
    case 'fullBackup':
      return 'transfer.export.fullBackup';

    case 'lightweightBackup':
      return 'transfer.export.lightweightBackup';

    case 'csv':
      return 'transfer.export.csv';
  }
};

export const ExportScopeStep = ({
  format,

  disabled,
  allDisabled,

  onBack,

  onExportAll,
  onSelectPeriod,
  onSelectEntries,
}: ExportScopeStepProps) => {
  const { t } = useTranslation();

  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const [allEmpty, setAllEmpty] = useState(false);

  const [confirmationStats, setConfirmationStats] =
    useState<DiaryExportScopeStats | null>(null);

  const { stats, isFetching, error, refresh } = useDiaryExportAllStats();

  const handleSelectAll = async (): Promise<void> => {
    if (disabled || allDisabled || isFetching) {
      return;
    }

    setAllEmpty(false);
    setConfirmationStats(null);

    const result = await refresh();

    if (result.error !== null && result.error !== undefined) {
      return;
    }

    const refreshedStats = result.data ?? stats;

    if (refreshedStats === null || refreshedStats.entriesCount === 0) {
      setAllEmpty(true);

      return;
    }

    setConfirmationStats(refreshedStats);

    setConfirmationVisible(true);
  };

  const confirmationDescription =
    confirmationStats === null
      ? ''
      : [
          `${t(
            'transfer.export.result.entries'
          )}: ${confirmationStats.entriesCount}`,

          ...(format === 'fullBackup'
            ? [
                `${t(
                  'transfer.export.result.photos'
                )}: ${confirmationStats.localPhotosCount}`,
              ]
            : []),
        ].join('\n');

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.export.scope.title')}
        disabled={disabled}
        onBack={onBack}
      />

      <s.Options>
        <s.OptionContent>
          <s.OptionDescription>
            {t(getFormatTitleKey(format))}
          </s.OptionDescription>
        </s.OptionContent>

        <TransferStepOption
          icon="albums-outline"
          title={t('transfer.export.scope.all')}
          description={t('transfer.export.scope.allDescription')}
          disabled={disabled || allDisabled || isFetching}
          onPress={() => {
            void handleSelectAll();
          }}
        />

        {allEmpty && (
          <s.OptionDescription>
            {t('transfer.export.errors.empty')}
          </s.OptionDescription>
        )}

        {error !== null && (
          <s.OptionDescription>
            {t('transfer.export.errors.failed')}
          </s.OptionDescription>
        )}

        <TransferStepOption
          icon="calendar-outline"
          title={t('transfer.export.scope.period')}
          description={t('transfer.export.scope.periodDescription')}
          disabled={disabled}
          onPress={onSelectPeriod}
        />

        <TransferStepOption
          icon="checkbox-outline"
          title={t('transfer.export.scope.selected')}
          description={t('transfer.export.scope.selectedDescription')}
          disabled={disabled}
          onPress={onSelectEntries}
        />
      </s.Options>

      <ConfirmDialog
        visible={confirmationVisible}
        title={t('transfer.export.scope.all')}
        description={confirmationDescription}
        confirmLabel={t('transfer.actions.export')}
        confirmDisabled={
          disabled ||
          confirmationStats === null ||
          confirmationStats.entriesCount === 0
        }
        onConfirm={() => {
          setConfirmationVisible(false);
          setConfirmationStats(null);

          onExportAll();
        }}
        onClose={() => {
          if (!disabled) {
            setConfirmationVisible(false);
            setConfirmationStats(null);
          }
        }}
      />
    </s.Screen>
  );
};
