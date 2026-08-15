import { useTranslation } from 'react-i18next';

import type { DiaryExportFormat } from '@features/export-diary';

import * as s from '../styles/DiaryTransferModal';

import {
  TransferStepHeader,
  TransferStepOption,
} from './TransferStepPrimitives';

type ExportFormatStepProps = {
  disabled: boolean;

  onBack: () => void;

  onSelectFormat: (format: DiaryExportFormat) => void;

  onOpenCreatedExports: () => void;
};

export const ExportFormatStep = ({
  disabled,

  onBack,
  onSelectFormat,
  onOpenCreatedExports,
}: ExportFormatStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.export.title')}
        disabled={disabled}
        onBack={onBack}
      />

      <s.Options>
        <TransferStepOption
          icon="archive-outline"
          title={t('transfer.export.fullBackup')}
          description={t('transfer.export.fullBackupDescription')}
          disabled={disabled}
          onPress={() => {
            onSelectFormat('fullBackup');
          }}
        />

        <TransferStepOption
          icon="archive-outline"
          title={t('transfer.export.lightweightBackup')}
          description={t('transfer.export.lightweightBackupDescription')}
          disabled={disabled}
          onPress={() => {
            onSelectFormat('lightweightBackup');
          }}
        />

        <TransferStepOption
          icon="document-text-outline"
          title={t('transfer.export.csv')}
          description={t('transfer.export.csvDescription')}
          disabled={disabled}
          onPress={() => {
            onSelectFormat('csv');
          }}
        />

        <TransferStepOption
          icon="folder-open-outline"
          title={t('transfer.export.createdExports')}
          disabled={disabled}
          onPress={onOpenCreatedExports}
        />
      </s.Options>
    </s.Screen>
  );
};
