import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

import {
  type DiaryExportFormat,
  type DiaryExportResult,
  ExportFileActionsScreen,
} from '@features/export-diary';
import type { DiaryTransferState } from '@entities/diary';
import { Button } from '@shared/ui';

import * as layout from '../styles/DiaryTransferModal';
import * as s from '../styles/ExportProgressResultScreen';

type ExportProgressResultScreenProps = {
  format: DiaryExportFormat;

  transferState: DiaryTransferState;

  result: DiaryExportResult | null;
  error: Error | null;
  empty: boolean;

  onBack: () => void;
  onDone: () => void;
};

const RING_SIZE = 76;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;

const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const getPercent = (current: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
};

export const ExportProgressResultScreen = ({
  format,

  transferState,

  result,
  error,
  empty,

  onBack,
  onDone,
}: ExportProgressResultScreenProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const entriesPercent = getPercent(
    transferState.processedEntries,
    transferState.totalEntries
  );

  const photosPercent = getPercent(
    transferState.processedPhotos,
    transferState.totalPhotos
  );

  const totalProgressUnits =
    transferState.totalEntries +
    (format === 'fullBackup' ? transferState.totalPhotos : 0);

  const processedProgressUnits =
    transferState.processedEntries +
    (format === 'fullBackup' ? transferState.processedPhotos : 0);

  const overallPercent = getPercent(processedProgressUnits, totalProgressUnits);

  const renderRing = () => {
    const progress = result === null ? overallPercent : 100;

    const dashOffset = RING_CIRCUMFERENCE * (1 - progress / 100);

    return (
      <s.ProgressRing>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={theme.colors.input}
            strokeWidth={RING_STROKE}
          />

          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth={RING_STROKE}
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>

        <s.ProgressRingIcon pointerEvents="none">
          <Ionicons
            name="download-outline"
            size={28}
            color={theme.colors.primary}
          />
        </s.ProgressRingIcon>
      </s.ProgressRing>
    );
  };

  const renderProgressBar = (percent: number) => (
    <s.ProgressTrack>
      <s.ProgressFill $percent={percent} />
    </s.ProgressTrack>
  );

  if (result !== null) {
    const photosCount =
      format === 'fullBackup' ? result.photosCount : undefined;

    const skippedPhotosCount =
      format === 'fullBackup' ? result.skippedPhotosCount : undefined;

    return (
      <ExportFileActionsScreen
        file={result}
        entriesCount={result.entriesCount}
        photosCount={photosCount}
        skippedPhotosCount={skippedPhotosCount}
        onBack={onDone}
      />
    );
  }

  if (error !== null || empty) {
    return (
      <layout.Screen>
        <s.FailureCenteredSection>
          <s.FailureIcon>
            <Ionicons name="close" size={34} color={theme.colors.danger} />
          </s.FailureIcon>

          <layout.OptionTitle>
            {empty
              ? t('transfer.export.errors.empty')
              : t('transfer.export.result.failedTitle')}
          </layout.OptionTitle>

          {!empty && (
            <>
              <layout.OptionDescription>
                {t('transfer.export.result.failedProgress', {
                  current: transferState.processedEntries,

                  total: transferState.totalEntries,
                })}
              </layout.OptionDescription>

              <layout.OptionDescription>
                {t('transfer.export.result.noFileCreated')}
              </layout.OptionDescription>
            </>
          )}
        </s.FailureCenteredSection>

        <Button tone="input" onPress={onBack}>
          <layout.OptionTitle>{t('transfer.actions.back')}</layout.OptionTitle>
        </Button>
      </layout.Screen>
    );
  }

  const processingEntries =
    transferState.totalEntries === 0 ||
    transferState.processedEntries < transferState.totalEntries;

  const processingPhotos =
    format === 'fullBackup' &&
    transferState.totalPhotos > 0 &&
    transferState.processedEntries >= transferState.totalEntries &&
    transferState.processedPhotos < transferState.totalPhotos;

  const statusTitle =
    transferState.phase === 'waitingForSync'
      ? t('transfer.export.progress.waitingTitle')
      : processingEntries
        ? t('transfer.export.progress.preparingTitle')
        : processingPhotos
          ? t('transfer.export.progress.photosTitle')
          : t('transfer.export.progress.finalizingTitle');

  const statusDescription =
    transferState.phase === 'waitingForSync'
      ? t('transfer.export.progress.waitingDescription')
      : processingEntries
        ? t('transfer.export.progress.preparingDescription')
        : processingPhotos
          ? t('transfer.export.progress.photosDescription')
          : t('transfer.export.progress.finalizingDescription');

  return (
    <layout.Screen>
      <s.CenteredSection>
        {renderRing()}

        <layout.OptionTitle>{statusTitle}</layout.OptionTitle>

        <layout.OptionDescription>{statusDescription}</layout.OptionDescription>
      </s.CenteredSection>

      <s.ProgressCard>
        <s.ProgressBlock>
          <layout.OptionDescription>
            {t('transfer.export.progress.entriesProcessed')}
          </layout.OptionDescription>

          <layout.OptionTitle>
            {t('transfer.files.progress.entries', {
              current: transferState.processedEntries,

              total: transferState.totalEntries,
            })}
          </layout.OptionTitle>

          {renderProgressBar(entriesPercent)}
        </s.ProgressBlock>

        {format === 'fullBackup' && transferState.totalPhotos > 0 && (
          <s.ProgressBlock>
            <layout.OptionDescription>
              {t('transfer.export.progress.photosAdded')}
            </layout.OptionDescription>

            <layout.OptionTitle>
              {t('transfer.files.progress.photos', {
                current: transferState.processedPhotos,

                total: transferState.totalPhotos,
              })}
            </layout.OptionTitle>

            {renderProgressBar(photosPercent)}
          </s.ProgressBlock>
        )}
      </s.ProgressCard>

      <s.LockedNotice>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={theme.colors.shades.warning.text}
        />

        <s.LockedNoticeText>
          {t('transfer.export.progress.locked')}
        </s.LockedNoticeText>
      </s.LockedNotice>
    </layout.Screen>
  );
};
