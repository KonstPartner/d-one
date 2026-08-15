import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryTransferModal';

import {
  TransferStepHeader,
  TransferStepOption,
} from './TransferStepPrimitives';

type ImportChooseFileStepProps = {
  disabled: boolean;
  devicePickerDisabled: boolean;

  onBack: () => void;

  onChooseFromDevice: () => void;
  onOpenCreatedBackups: () => void;
};

export const ImportChooseFileStep = ({
  disabled,
  devicePickerDisabled,

  onBack,

  onChooseFromDevice,
  onOpenCreatedBackups,
}: ImportChooseFileStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.title')}
        disabled={disabled}
        onBack={onBack}
      />

      <s.Options>
        <TransferStepOption
          icon="arrow-up-outline"
          title={t('transfer.import.chooseFromDevice')}
          disabled={disabled || devicePickerDisabled}
          onPress={onChooseFromDevice}
        />

        <TransferStepOption
          icon="folder-open-outline"
          title={t('transfer.import.createdBackups')}
          disabled={disabled}
          onPress={onOpenCreatedBackups}
        />
      </s.Options>
    </s.Screen>
  );
};
