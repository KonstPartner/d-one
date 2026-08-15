import { useTranslation } from 'react-i18next';

import type { DiaryImportExecutionResult } from '@features/import-diary';
import type { DiaryTransferState } from '@entities/diary';
import { Button, LoadingView } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

import { TransferStepHeader } from './TransferStepPrimitives';

type ImportProgressResultScreenProps = {
  transferState: DiaryTransferState;

  result: DiaryImportExecutionResult | null;

  error: Error | null;

  onDone: () => void;
};

type ImportResultSummaryProps = {
  result: DiaryImportExecutionResult;
};

const ImportResultSummary = ({ result }: ImportResultSummaryProps) => {
  const { t } = useTranslation();

  return (
    <s.Options>
      <s.OptionContent>
        <s.OptionDescription>
          {t('transfer.import.result.processed')}
        </s.OptionDescription>

        <s.OptionTitle>
          {t('transfer.import.result.processedValue', {
            current: result.processedEntries,
            total: result.totalEntries,
          })}
        </s.OptionTitle>
      </s.OptionContent>

      <s.OptionContent>
        <s.OptionDescription>
          {t('transfer.import.result.added')}
        </s.OptionDescription>

        <s.OptionTitle>{result.addedEntries}</s.OptionTitle>
      </s.OptionContent>

      <s.OptionContent>
        <s.OptionDescription>
          {t('transfer.import.result.replaced')}
        </s.OptionDescription>

        <s.OptionTitle>{result.replacedEntries}</s.OptionTitle>
      </s.OptionContent>

      <s.OptionContent>
        <s.OptionDescription>
          {t('transfer.import.result.skipped')}
        </s.OptionDescription>

        <s.OptionTitle>{result.skippedEntries}</s.OptionTitle>
      </s.OptionContent>
    </s.Options>
  );
};

export const ImportProgressResultScreen = ({
  transferState,

  result,
  error,

  onDone,
}: ImportProgressResultScreenProps) => {
  const { t } = useTranslation();

  const processing =
    (transferState.phase === 'resolvingConflicts' ||
      transferState.phase === 'processing') &&
    result === null &&
    error === null;

  if (processing) {
    return (
      <s.Screen>
        <TransferStepHeader
          title={t('transfer.import.progress.title')}
          disabled
        />

        <s.Options>
          <LoadingView />

          <s.OptionContent>
            <s.OptionTitle>
              {t('transfer.import.progress.importing')}
            </s.OptionTitle>

            <s.OptionDescription>
              {t('transfer.import.progress.entries', {
                current: transferState.processedEntries,
                total: transferState.totalEntries,
              })}
            </s.OptionDescription>

            {transferState.totalPhotos > 0 && (
              <s.OptionDescription>
                {t('transfer.import.progress.photos', {
                  current: transferState.processedPhotos,
                  total: transferState.totalPhotos,
                })}
              </s.OptionDescription>
            )}

            <s.OptionDescription>
              {t('transfer.import.progress.locked')}
            </s.OptionDescription>
          </s.OptionContent>
        </s.Options>
      </s.Screen>
    );
  }

  if (error !== null && result !== null && result.processedEntries > 0) {
    return (
      <s.Screen>
        <TransferStepHeader
          title={t('transfer.import.result.partialTitle')}
          disabled={false}
        />

        <s.OptionContent>
          <s.OptionTitle>
            {t('transfer.import.result.partialTitle')}
          </s.OptionTitle>

          <s.OptionDescription>
            {t('transfer.import.result.partialDescription')}
          </s.OptionDescription>
        </s.OptionContent>

        <ImportResultSummary result={result} />

        <Button tone="primary" onPress={onDone}>
          {t('transfer.import.result.done')}
        </Button>
      </s.Screen>
    );
  }

  if (result !== null) {
    return (
      <s.Screen>
        <TransferStepHeader
          title={t('transfer.import.result.title')}
          disabled={false}
        />

        <s.OptionContent>
          <s.OptionTitle>{t('transfer.import.result.title')}</s.OptionTitle>

          <s.OptionDescription>
            {t('transfer.import.result.description')}
          </s.OptionDescription>
        </s.OptionContent>

        <ImportResultSummary result={result} />

        <Button tone="primary" onPress={onDone}>
          {t('transfer.import.result.done')}
        </Button>
      </s.Screen>
    );
  }

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.result.failedTitle')}
        disabled={false}
      />

      <s.OptionContent>
        <s.OptionTitle>{t('transfer.import.result.failedTitle')}</s.OptionTitle>

        <s.OptionDescription>
          {t('transfer.import.result.failedDescription')}
        </s.OptionDescription>
      </s.OptionContent>

      <Button tone="primary" onPress={onDone}>
        {t('transfer.import.result.done')}
      </Button>
    </s.Screen>
  );
};
