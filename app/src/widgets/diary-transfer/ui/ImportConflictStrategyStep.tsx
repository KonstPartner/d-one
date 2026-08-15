import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryTransferModal';

import {
  TransferStepHeader,
  TransferStepOption,
} from './TransferStepPrimitives';

type ImportConflictStrategyStepProps = {
  matchesCount: number;

  disabled: boolean;

  onBack: () => void;

  reviewDisabled?: boolean;

  onSkipAll: () => void;
  onReplaceAll: () => void;
  onReviewIndividually?: () => void;
};

export const ImportConflictStrategyStep = ({
  matchesCount,

  disabled,

  onBack,

  reviewDisabled = false,

  onSkipAll,
  onReplaceAll,
  onReviewIndividually,
}: ImportConflictStrategyStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.conflicts.title')}
        disabled={disabled}
        onBack={onBack}
      />

      <s.Options>
        <s.OptionContent>
          <s.OptionTitle>
            {t('transfer.import.conflicts.matches', {
              count: matchesCount,
            })}
          </s.OptionTitle>

          <s.OptionDescription>
            {t('transfer.import.conflicts.description')}
          </s.OptionDescription>
        </s.OptionContent>

        <TransferStepOption
          icon="play-skip-forward-outline"
          title={t('transfer.import.conflicts.skipAll')}
          description={t('transfer.import.conflicts.skipAllDescription')}
          disabled={disabled}
          onPress={onSkipAll}
        />

        <TransferStepOption
          icon="refresh-outline"
          title={t('transfer.import.conflicts.replaceAll')}
          description={t('transfer.import.conflicts.replaceAllDescription')}
          disabled={disabled}
          onPress={onReplaceAll}
        />

        <TransferStepOption
          icon="list-outline"
          title={t('transfer.import.conflicts.reviewIndividually')}
          description={t(
            'transfer.import.conflicts.reviewIndividuallyDescription'
          )}
          disabled={
            disabled || reviewDisabled || onReviewIndividually === undefined
          }
          onPress={onReviewIndividually ?? (() => undefined)}
        />
      </s.Options>
    </s.Screen>
  );
};
