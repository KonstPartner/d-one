import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryTransferModal';

import { ExportSelectedEntriesScreen } from './ExportSelectedEntriesScreen';
import { TransferStepHeader } from './TransferStepPrimitives';

type ExportSelectedEntriesStepProps = {
  disabled: boolean;

  onBack: () => void;

  onExport: (entryIds: readonly string[]) => Promise<void>;
};

export const ExportSelectedEntriesStep = ({
  disabled,

  onBack,
  onExport,
}: ExportSelectedEntriesStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.export.scope.selected')}
        disabled={disabled}
        onBack={onBack}
      />

      <ExportSelectedEntriesScreen disabled={disabled} onExport={onExport} />
    </s.Screen>
  );
};
