import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DiaryImportPreview,
  type DiaryImportSource,
} from '@features/import-diary';
import type { DiaryTransferState } from '@entities/diary';
import { Button, LoadingView } from '@shared/ui';

import type { ImportConflictStrategySelection } from '../model/diaryImportFlow.types';
import * as f from '../styles/DiaryImportPreview';
import * as s from '../styles/DiaryTransferModal';

import { TransferStepHeader } from './TransferStepPrimitives';

type ImportPreviewStepProps = {
  source: DiaryImportSource;

  preview: DiaryImportPreview | null;
  isPreparing: boolean;
  transferPhase: DiaryTransferState['phase'];

  processedEntries: number;
  totalEntries: number;

  selectedConflictStrategy: ImportConflictStrategySelection | null;

  onPrepare: (source: DiaryImportSource) => Promise<DiaryImportPreview | null>;
  onSelectConflictStrategy: (strategy: ImportConflictStrategySelection) => void;

  onCancel: () => void;
  onPreparationFailed: () => void;
  onContinue: () => void;
};

type PreviewMetaRowProps = {
  label: string;
  value: ReactNode;
  warning?: boolean;
};

type StrategyOptionProps = {
  selected: boolean;
  title: string;
  description: string;
  onPress: () => void;
};

const PreviewMetaRow = ({
  label,
  value,
  warning = false,
}: PreviewMetaRowProps) => (
  <f.MetaRow>
    <f.MetaLabel>{label}</f.MetaLabel>
    <f.MetaValue $warning={warning}>{value}</f.MetaValue>
  </f.MetaRow>
);

const StrategyOption = ({
  selected,
  title,
  description,
  onPress,
}: StrategyOptionProps) => (
  <f.StrategyOption
    accessibilityRole="radio"
    accessibilityLabel={title}
    accessibilityState={{ selected }}
    $selected={selected}
    onPress={onPress}
    style={f.getStrategyPressStyle}
  >
    <f.StrategyDot $selected={selected}>
      {selected && <f.StrategyDotInner />}
    </f.StrategyDot>

    <f.StrategyContent>
      <f.StrategyTitle>{title}</f.StrategyTitle>
      <f.StrategyDescription>{description}</f.StrategyDescription>
    </f.StrategyContent>
  </f.StrategyOption>
);

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
  isPreparing,
  transferPhase,
  processedEntries,
  totalEntries,
  selectedConflictStrategy,
  onPrepare,
  onSelectConflictStrategy,
  onCancel,
  onPreparationFailed,
  onContinue,
}: ImportPreviewStepProps) => {
  const { t, i18n } = useTranslation();

  const preparationStartedRef = useRef(false);

  const startPreparation = useCallback((): void => {
    if (preparationStartedRef.current || isPreparing || preview !== null) {
      return;
    }

    preparationStartedRef.current = true;

    void onPrepare(source).then((preparedPreview) => {
      if (preparedPreview === null) {
        onPreparationFailed();
      }
    });
  }, [isPreparing, onPrepare, onPreparationFailed, preview, source]);

  useEffect(() => {
    if (preview === null) {
      startPreparation();
    }
  }, [preview, startPreparation]);

  const waitingForSync = transferPhase === 'waitingForSync';

  const backDisabled =
    isPreparing || waitingForSync || transferPhase === 'validating';

  const language = i18n.resolvedLanguage ?? i18n.language;

  const continueDisabled =
    preview !== null &&
    preview.matchesCount > 0 &&
    selectedConflictStrategy === null;

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.preview.title')}
        disabled={backDisabled}
        onBack={onCancel}
      />

      {preview === null ? (
        <f.LoadingState>
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
        </f.LoadingState>
      ) : (
        <f.Scroll showsVerticalScrollIndicator={false}>
          <f.Content>
            <f.Intro>
              <f.IntroTitle>
                {t('transfer.import.preview.heading')}
              </f.IntroTitle>
              <f.IntroDescription>
                {t('transfer.import.preview.description')}
              </f.IntroDescription>
            </f.Intro>

            <f.MetaList>
              <PreviewMetaRow
                label={t('transfer.import.preview.type')}
                value={t(getExportTypeKey(preview))}
              />
              <PreviewMetaRow
                label={t('transfer.import.preview.created')}
                value={formatExportedAt(preview.exportedAt, language)}
              />
              <PreviewMetaRow
                label={t('transfer.import.preview.source')}
                value={preview.sourceUserName}
              />
              <PreviewMetaRow
                label={t('transfer.import.preview.entries')}
                value={preview.entriesCount}
              />
              <PreviewMetaRow
                label={t('transfer.import.preview.photos')}
                value={preview.photosCount}
              />
              <PreviewMetaRow
                label={t('transfer.import.preview.matches')}
                value={preview.matchesCount}
                warning={preview.matchesCount > 0}
              />
            </f.MetaList>

            {preview.matchesCount > 0 && (
              <>
                <f.Intro>
                  <f.IntroTitle>
                    {t('transfer.import.conflicts.title')}
                  </f.IntroTitle>
                  <f.IntroDescription>
                    {t('transfer.import.conflicts.description')}
                  </f.IntroDescription>
                </f.Intro>

                <f.StrategyList>
                  <StrategyOption
                    selected={selectedConflictStrategy === 'skip'}
                    title={t('transfer.import.conflicts.skipAll')}
                    description={t(
                      'transfer.import.conflicts.skipAllDescription'
                    )}
                    onPress={() => {
                      onSelectConflictStrategy('skip');
                    }}
                  />
                  <StrategyOption
                    selected={selectedConflictStrategy === 'replace'}
                    title={t('transfer.import.conflicts.replaceAll')}
                    description={t(
                      'transfer.import.conflicts.replaceAllDescription'
                    )}
                    onPress={() => {
                      onSelectConflictStrategy('replace');
                    }}
                  />
                  <StrategyOption
                    selected={selectedConflictStrategy === 'review'}
                    title={t('transfer.import.conflicts.reviewIndividually')}
                    description={t(
                      'transfer.import.conflicts.reviewIndividuallyDescription'
                    )}
                    onPress={() => {
                      onSelectConflictStrategy('review');
                    }}
                  />
                </f.StrategyList>
              </>
            )}

            <f.ActionRow>
              <Button
                tone="input"
                style={f.actionButtonStyle}
                onPress={onCancel}
              >
                {t('transfer.actions.cancel')}
              </Button>

              <Button
                tone={continueDisabled ? 'muted' : 'primary'}
                disabled={continueDisabled}
                style={f.actionButtonStyle}
                onPress={onContinue}
              >
                {t('transfer.actions.continue')}
              </Button>
            </f.ActionRow>
          </f.Content>
        </f.Scroll>
      )}
    </s.Screen>
  );
};
