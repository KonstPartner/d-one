import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { DiaryImportExecutionResult } from '@features/import-diary';
import type { DiaryTransferState } from '@entities/diary';
import { Button } from '@shared/ui';

import * as f from '../styles/DiaryImportStatus';
import * as s from '../styles/DiaryTransferModal';

type ImportProgressResultScreenProps = {
  transferState: DiaryTransferState;

  result: DiaryImportExecutionResult | null;

  onDone: () => void;
};

type ImportResultSummaryProps = {
  result: DiaryImportExecutionResult;
};

const getProgress = (current: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (current / total) * 100));
};

const ImportResultSummary = ({ result }: ImportResultSummaryProps) => {
  const { t } = useTranslation();

  return (
    <f.ResultGrid>
      <f.ResultStat>
        <f.ResultStatValue>{result.addedEntries}</f.ResultStatValue>

        <f.ResultStatLabel>
          {t('transfer.import.result.added')}
        </f.ResultStatLabel>
      </f.ResultStat>

      <f.ResultStat>
        <f.ResultStatValue>{result.replacedEntries}</f.ResultStatValue>

        <f.ResultStatLabel>
          {t('transfer.import.result.replaced')}
        </f.ResultStatLabel>
      </f.ResultStat>

      <f.ResultStat>
        <f.ResultStatValue>{result.skippedEntries}</f.ResultStatValue>

        <f.ResultStatLabel>
          {t('transfer.import.result.skipped')}
        </f.ResultStatLabel>
      </f.ResultStat>

      <f.ResultStat>
        <f.ResultStatValue>{result.processedEntries}</f.ResultStatValue>

        <f.ResultStatLabel>
          {t('transfer.import.result.processed')}
        </f.ResultStatLabel>
      </f.ResultStat>
    </f.ResultGrid>
  );
};

export const ImportProgressResultScreen = ({
  transferState,
  result,
  onDone,
}: ImportProgressResultScreenProps) => {
  const { t } = useTranslation();

  const theme = useTheme();

  if (result === null) {
    if (
      transferState.phase !== 'resolvingConflicts' &&
      transferState.phase !== 'processing'
    ) {
      return null;
    }

    const progress = getProgress(
      transferState.processedEntries,
      transferState.totalEntries
    );

    return (
      <s.Screen>
        <f.ProgressCard>
          <f.ProgressIcon>
            <Ionicons
              name="cloud-upload-outline"
              size={34}
              color={theme.colors.primary}
            />
          </f.ProgressIcon>

          <f.ProgressTitle>
            {t('transfer.import.progress.importing')}
          </f.ProgressTitle>

          <f.ProgressDescription>
            {t('transfer.import.progress.chunkDescription')}
          </f.ProgressDescription>

          <f.ProgressBlock>
            <f.ProgressHead>
              <f.ProgressText>
                {t('transfer.import.progress.processed')}
              </f.ProgressText>

              <f.ProgressText>
                {t('transfer.import.progress.entriesValue', {
                  current: transferState.processedEntries,

                  total: transferState.totalEntries,
                })}
              </f.ProgressText>
            </f.ProgressHead>

            <f.ProgressTrack>
              <f.ProgressFill $progress={progress} />
            </f.ProgressTrack>
          </f.ProgressBlock>

          <f.LockNote>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.colors.muted}
            />

            <f.LockText>{t('transfer.import.progress.locked')}</f.LockText>
          </f.LockNote>
        </f.ProgressCard>
      </s.Screen>
    );
  }

  return (
    <s.Screen>
      <f.Scroll showsVerticalScrollIndicator={false}>
        <f.Content>
          <f.ResultHero>
            <f.ResultIcon $tone="success">
              <Ionicons name="checkmark" size={36} color={theme.colors.white} />
            </f.ResultIcon>

            <f.ResultTitle>{t('transfer.import.result.title')}</f.ResultTitle>

            <f.ResultDescription>
              {t('transfer.import.result.description')}
            </f.ResultDescription>
          </f.ResultHero>

          <ImportResultSummary result={result} />

          <f.CloudWarning>
            <f.CloudWarningText>
              {t('transfer.import.result.cloudWarning')}
            </f.CloudWarningText>
          </f.CloudWarning>

          <Button tone="primary" onPress={onDone}>
            {t('transfer.import.result.done')}
          </Button>
        </f.Content>
      </f.Scroll>
    </s.Screen>
  );
};
