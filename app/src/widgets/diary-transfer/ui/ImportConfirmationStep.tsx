import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';

import type { ImportConfirmationSummary } from '../model/diaryImportFlow.types';
import * as f from '../styles/DiaryImportPreview';
import * as s from '../styles/DiaryTransferModal';

import { TransferStepHeader } from './TransferStepPrimitives';

type ImportConfirmationStepProps = {
  summary: ImportConfirmationSummary;

  onCancel: () => void;
  onStart: () => void;
};

type SummaryStatProps = {
  value: number;
  label: string;
};

const SummaryStat = ({ value, label }: SummaryStatProps) => (
  <f.Stat>
    <f.StatValue>{value}</f.StatValue>
    <f.StatLabel>{label}</f.StatLabel>
  </f.Stat>
);

export const ImportConfirmationStep = ({
  summary,
  onCancel,
  onStart,
}: ImportConfirmationStepProps) => {
  const { t } = useTranslation();

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.confirmation.header')}
        disabled={false}
        onBack={onCancel}
      />

      <f.Scroll showsVerticalScrollIndicator={false}>
        <f.Content>
          <f.Intro>
            <f.IntroTitle>
              {t('transfer.import.confirmation.title', {
                count: summary.entriesCount,
              })}
            </f.IntroTitle>
            <f.IntroDescription>
              {t('transfer.import.confirmation.description')}
            </f.IntroDescription>
          </f.Intro>

          <f.SummaryCard>
            <f.StatGrid>
              <SummaryStat
                value={summary.newEntries}
                label={t('transfer.import.confirmation.newEntries')}
              />
              <SummaryStat
                value={summary.replacedEntries}
                label={t('transfer.import.confirmation.replace')}
              />
              <SummaryStat
                value={summary.skippedEntries}
                label={t('transfer.import.confirmation.skip')}
              />
              <SummaryStat
                value={summary.photosCount}
                label={t('transfer.import.confirmation.photos')}
              />
            </f.StatGrid>
          </f.SummaryCard>

          <f.ActionRow>
            <Button tone="input" style={f.actionButtonStyle} onPress={onCancel}>
              {t('transfer.actions.cancel')}
            </Button>
            <Button
              tone="primary"
              style={f.actionButtonStyle}
              onPress={onStart}
            >
              {t('transfer.import.confirmation.start')}
            </Button>
          </f.ActionRow>
        </f.Content>
      </f.Scroll>
    </s.Screen>
  );
};
