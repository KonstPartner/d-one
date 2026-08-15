import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryImportPreview,
  type DiaryImportSource,
  type DiaryImportValidationErrorCode,
  isDiaryImportValidationError,
} from '@features/import-diary';
import type { DiaryTransferState } from '@entities/diary';
import { Button, ErrorSection, LoadingView } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

import { TransferStepHeader } from './TransferStepPrimitives';

type ImportPreviewStepProps = {
  source: DiaryImportSource;

  preview: DiaryImportPreview | null;
  error: Error | null;

  isPreparing: boolean;

  transferPhase: DiaryTransferState['phase'];

  processedEntries: number;
  totalEntries: number;

  onPrepare: (source: DiaryImportSource) => Promise<DiaryImportPreview | null>;

  onCancel: () => void;
  onContinue?: () => void;
};

type PreviewFieldProps = {
  label: string;
  value: ReactNode;
  description?: string;
};

const VALIDATION_ERROR_KEYS: Record<DiaryImportValidationErrorCode, string> = {
  unsupportedPlatform: 'transfer.import.errors.unsupportedPlatform',
  invalidArchive: 'transfer.import.errors.invalidArchive',
  manifestMissing: 'transfer.import.errors.manifestMissing',
  manifestInvalid: 'transfer.import.errors.manifestInvalid',
  unsupportedVersion: 'transfer.import.errors.unsupportedVersion',
  unsafePath: 'transfer.import.errors.unsafePath',
  chunkMissing: 'transfer.import.errors.chunkMissing',
  chunkInvalid: 'transfer.import.errors.chunkInvalid',
  entryInvalid: 'transfer.import.errors.entryInvalid',
  duplicateEntryId: 'transfer.import.errors.duplicateEntryId',
  entryCountMismatch: 'transfer.import.errors.entryCountMismatch',
};

const PreviewField = ({ label, value, description }: PreviewFieldProps) => (
  <s.OptionContent>
    <s.OptionDescription>{label}</s.OptionDescription>

    <s.OptionTitle>{value}</s.OptionTitle>

    {description !== undefined && (
      <s.OptionDescription>{description}</s.OptionDescription>
    )}
  </s.OptionContent>
);

const getValidationErrorKey = (error: Error): string =>
  isDiaryImportValidationError(error)
    ? VALIDATION_ERROR_KEYS[error.code]
    : 'transfer.import.errors.unknown';

const getExportTypeKey = (
  preview: DiaryImportPreview
): 'transfer.export.fullBackup' | 'transfer.export.lightweightBackup' =>
  preview.exportType === 'fullBackup'
    ? 'transfer.export.fullBackup'
    : 'transfer.export.lightweightBackup';

const formatExportedAt = (value: string, language: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
};

export const ImportPreviewStep = ({
  source,
  preview,
  error,
  isPreparing,
  transferPhase,
  processedEntries,
  totalEntries,
  onPrepare,
  onCancel,
  onContinue,
}: ImportPreviewStepProps) => {
  const { t, i18n } = useTranslation();

  const preparationStartedRef = useRef(false);

  const startPreparation = useCallback((): void => {
    if (preparationStartedRef.current || isPreparing || preview !== null) {
      return;
    }

    preparationStartedRef.current = true;

    void onPrepare(source);
  }, [isPreparing, onPrepare, preview, source]);

  useEffect(() => {
    if (error === null && preview === null) {
      startPreparation();
    }
  }, [error, preview, startPreparation]);

  const handleRetry = useCallback((): void => {
    preparationStartedRef.current = false;

    startPreparation();
  }, [startPreparation]);

  const waitingForSync = transferPhase === 'waitingForSync';

  const backDisabled =
    isPreparing || waitingForSync || transferPhase === 'validating';

  const language = i18n.resolvedLanguage ?? i18n.language;

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.preview.title')}
        disabled={backDisabled}
        onBack={onCancel}
      />

      {error !== null ? (
        <>
          <ErrorSection
            message={t(getValidationErrorKey(error))}
            onRetry={handleRetry}
          />

          <Button tone="input" onPress={onCancel}>
            {t('transfer.actions.cancel')}
          </Button>
        </>
      ) : preview === null ? (
        <s.Options>
          <LoadingView />

          <s.OptionContent>
            <s.OptionTitle>
              {t(
                waitingForSync
                  ? 'transfer.import.preview.waitingTitle'
                  : 'transfer.import.preview.validatingTitle'
              )}
            </s.OptionTitle>

            <s.OptionDescription>
              {t(
                waitingForSync
                  ? 'transfer.import.preview.waitingDescription'
                  : 'transfer.import.preview.validatingDescription'
              )}
            </s.OptionDescription>

            {totalEntries > 0 && (
              <s.OptionDescription>
                {t('transfer.import.preview.progress', {
                  current: processedEntries,
                  total: totalEntries,
                })}
              </s.OptionDescription>
            )}

            <s.OptionDescription>{source.fileName}</s.OptionDescription>
          </s.OptionContent>
        </s.Options>
      ) : (
        <>
          <s.Options>
            <PreviewField
              label={t('transfer.import.preview.file')}
              value={preview.fileName}
            />

            <PreviewField
              label={t('transfer.import.preview.type')}
              value={t(getExportTypeKey(preview))}
            />

            <PreviewField
              label={t('transfer.import.preview.created')}
              value={formatExportedAt(preview.exportedAt, language)}
            />

            <PreviewField
              label={t('transfer.import.preview.source')}
              value={preview.sourceUserName}
            />

            <PreviewField
              label={t('transfer.import.preview.entries')}
              value={preview.entriesCount}
            />

            <PreviewField
              label={t('transfer.import.preview.photos')}
              value={preview.photosCount}
            />

            <PreviewField
              label={t('transfer.import.preview.matches')}
              value={preview.matchesCount}
              description={t(
                preview.matchesCount === 0
                  ? 'transfer.import.preview.noMatches'
                  : 'transfer.import.preview.matchesDescription',
                {
                  count: preview.matchesCount,
                }
              )}
            />
          </s.Options>

          {onContinue !== undefined && (
            <Button tone="primary" onPress={onContinue}>
              {t('transfer.actions.continue')}
            </Button>
          )}

          <Button tone="input" onPress={onCancel}>
            {t('transfer.actions.cancel')}
          </Button>
        </>
      )}
    </s.Screen>
  );
};
