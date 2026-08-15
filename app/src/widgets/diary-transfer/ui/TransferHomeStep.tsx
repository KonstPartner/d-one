import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryTransferModal';

import {
  TransferStepHeader,
  TransferStepOption,
} from './TransferStepPrimitives';

type TransferHomeStepProps = {
  disabled: boolean;

  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
};

export const TransferHomeStep = ({
  disabled,

  onClose,
  onExport,
  onImport,
}: TransferHomeStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.title')}
        disabled={disabled}
        onClose={onClose}
      />

      <s.Options>
        <TransferStepOption
          icon="download-outline"
          title={t('transfer.actions.export')}
          disabled={disabled}
          onPress={onExport}
        />

        <TransferStepOption
          icon="arrow-up-outline"
          title={t('transfer.actions.import')}
          disabled={disabled}
          onPress={onImport}
        />
      </s.Options>
    </s.Screen>
  );
};
