import { useTranslation } from 'react-i18next';

import type { DiaryExportScope } from '@features/export-diary';

import * as s from '../styles/DiaryTransferModal';

import { ExportPeriodScreen } from './ExportPeriodScreen';
import { TransferStepHeader } from './TransferStepPrimitives';

type ExportPeriodStepProps = {
  disabled: boolean;

  onBack: () => void;

  onExport: (
    scope: Extract<DiaryExportScope, { type: 'period' }>
  ) => Promise<void>;
};

export const ExportPeriodStep = ({
  disabled,

  onBack,
  onExport,
}: ExportPeriodStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.export.scope.period')}
        disabled={disabled}
        onBack={onBack}
      />

      <ExportPeriodScreen disabled={disabled} onExport={onExport} />
    </s.Screen>
  );
};
