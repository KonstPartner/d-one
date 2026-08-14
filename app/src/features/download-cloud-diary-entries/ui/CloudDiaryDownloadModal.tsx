import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import {
  type CloudDiaryEntry,
  CloudDiaryEntryCard,
  CloudDiaryPhotoViewer,
  type DiaryEntry,
  DiaryEntryCard,
  DiaryPhotoViewer,
  useDiaryTransferState,
} from '@entities/diary';
import * as ss from '@shared/styles';
import { Button, Checkbox, PortalModal, Spinner } from '@shared/ui';

import type { useCloudDiaryDownloadFlow } from '../model/useCloudDiaryDownloadFlow';
import * as s from '../styles/CloudDiaryDownloadModal';

type CloudDiaryDownloadFlow = ReturnType<typeof useCloudDiaryDownloadFlow>;

type CloudDiaryDownloadModalProps = {
  flow: CloudDiaryDownloadFlow;

  onDone: () => void;

  onError: (error: unknown) => void;
};

export const CloudDiaryDownloadModal = ({
  flow,

  onDone,
  onError,
}: CloudDiaryDownloadModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const transfer = useDiaryTransferState();

  const [applyToRemaining, setApplyToRemaining] = useState(false);

  const [cloudPhotoEntry, setCloudPhotoEntry] =
    useState<CloudDiaryEntry | null>(null);

  const [localPhotoEntry, setLocalPhotoEntry] = useState<DiaryEntry | null>(
    null
  );

  const visible = flow.step !== 'idle';

  const closeCloudPhoto = useCallback(() => {
    setCloudPhotoEntry(null);
  }, []);

  const closeLocalPhoto = useCallback(() => {
    setLocalPhotoEntry(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!flow.canCancel) {
      return;
    }

    setCloudPhotoEntry(null);

    setLocalPhotoEntry(null);

    setApplyToRemaining(false);

    flow.cancel();
  }, [flow.cancel, flow.canCancel]);

  const runStrategy = useCallback(
    (strategy: 'skipAll' | 'replaceAll' | 'review') => {
      void flow.chooseStrategy(strategy).catch(onError);
    },
    [flow.chooseStrategy, onError]
  );

  const runResolution = useCallback(
    (resolution: 'skip' | 'replace') => {
      void flow
        .resolveCurrent(resolution, applyToRemaining)
        .then(() => {
          setApplyToRemaining(false);
        })
        .catch(onError);
    },
    [applyToRemaining, flow.resolveCurrent, onError]
  );

  const handleDone = useCallback(() => {
    flow.closeResult();

    onDone();
  }, [flow.closeResult, onDone]);

  return (
    <>
      <PortalModal
        visible={visible}
        withoutCloseBtn={!flow.canCancel}
        onClose={handleClose}
      >
        <s.Root>
          {flow.step === 'checking' ? (
            <s.Progress>
              <Spinner
                size={theme.control.height.md}
                color={theme.colors.primary}
              />

              <s.ProgressText style={ss.Subheading(theme)}>
                {t('diary.cloud.download.checking')}
              </s.ProgressText>
            </s.Progress>
          ) : null}

          {flow.step === 'strategy' ? (
            <>
              <s.Header>
                <s.Title style={ss.Heading(theme)}>
                  {t('diary.cloud.download.title')}
                </s.Title>

                <s.Description style={ss.Body(theme)}>
                  {t('diary.cloud.download.conflictsFound', {
                    count: flow.conflictsCount,
                  })}
                </s.Description>
              </s.Header>

              <s.StrategyList>
                <Button
                  tone="input"
                  style={ss.FullWidth}
                  accessibilityLabel={t('diary.cloud.download.skipAll')}
                  onPress={() => {
                    runStrategy('skipAll');
                  }}
                >
                  <s.StrategyContent>
                    <s.StrategyTitle style={ss.Subheading(theme)}>
                      {t('diary.cloud.download.skipAll')}
                    </s.StrategyTitle>

                    <s.StrategyDescription style={ss.Body(theme)}>
                      {t('diary.cloud.download.skipAllDescription')}
                    </s.StrategyDescription>
                  </s.StrategyContent>
                </Button>

                <Button
                  tone="input"
                  style={ss.FullWidth}
                  accessibilityLabel={t('diary.cloud.download.replaceAll')}
                  onPress={() => {
                    runStrategy('replaceAll');
                  }}
                >
                  <s.StrategyContent>
                    <s.StrategyTitle style={ss.Subheading(theme)}>
                      {t('diary.cloud.download.replaceAll')}
                    </s.StrategyTitle>

                    <s.StrategyDescription style={ss.Body(theme)}>
                      {t('diary.cloud.download.replaceAllDescription')}
                    </s.StrategyDescription>
                  </s.StrategyContent>
                </Button>

                <Button
                  tone="input"
                  style={ss.FullWidth}
                  accessibilityLabel={t('diary.cloud.download.review')}
                  onPress={() => {
                    runStrategy('review');
                  }}
                >
                  <s.StrategyContent>
                    <s.StrategyTitle style={ss.Subheading(theme)}>
                      {t('diary.cloud.download.review')}
                    </s.StrategyTitle>

                    <s.StrategyDescription style={ss.Body(theme)}>
                      {t('diary.cloud.download.reviewDescription')}
                    </s.StrategyDescription>
                  </s.StrategyContent>
                </Button>
              </s.StrategyList>
            </>
          ) : null}

          {flow.step === 'review' && flow.currentConflict !== null ? (
            <>
              <s.Header>
                <s.Title style={ss.Heading(theme)}>
                  {t('diary.cloud.download.resolveConflict')}
                </s.Title>
              </s.Header>

              <s.ConflictProgress>
                <s.ConflictProgressText style={ss.Body(theme)}>
                  {t('diary.cloud.download.conflictProgress', {
                    current: flow.reviewNumber,

                    total: flow.conflictsCount,
                  })}
                </s.ConflictProgressText>
              </s.ConflictProgress>

              <s.Comparison>
                <s.ComparisonSection>
                  <s.ComparisonLabel style={ss.Subheading(theme)}>
                    {t('diary.cloud.download.cloudEntry')}
                  </s.ComparisonLabel>

                  <CloudDiaryEntryCard
                    entry={flow.currentConflict.cloudEntry}
                    isVisible
                    onOpenPhoto={setCloudPhotoEntry}
                  />
                </s.ComparisonSection>

                <s.ComparisonSection>
                  <s.ComparisonLabel style={ss.Subheading(theme)}>
                    {t('diary.cloud.download.localEntry')}
                  </s.ComparisonLabel>

                  <DiaryEntryCard
                    entry={flow.currentConflict.localEntry}
                    readOnly
                    isVisible
                    onOpenPhoto={setLocalPhotoEntry}
                  />
                </s.ComparisonSection>
              </s.Comparison>

              <s.ReviewOptions>
                <Checkbox
                  checked={applyToRemaining}
                  onPress={() => {
                    setApplyToRemaining((current) => !current);
                  }}
                >
                  <s.CheckboxText style={ss.Body(theme)}>
                    {t('diary.cloud.download.applyToRemaining')}
                  </s.CheckboxText>
                </Checkbox>

                <s.Actions>
                  <s.Action>
                    <Button
                      tone="input"
                      style={ss.FullWidth}
                      accessibilityLabel={t('diary.cloud.download.skip')}
                      onPress={() => {
                        runResolution('skip');
                      }}
                    >
                      <s.InputButtonText style={ss.Text(theme)}>
                        {t('diary.cloud.download.skip')}
                      </s.InputButtonText>
                    </Button>
                  </s.Action>

                  <s.Action>
                    <Button
                      style={ss.FullWidth}
                      accessibilityLabel={t('diary.cloud.download.replace')}
                      onPress={() => {
                        runResolution('replace');
                      }}
                    >
                      <s.ButtonText style={ss.Text(theme)}>
                        {t('diary.cloud.download.replace')}
                      </s.ButtonText>
                    </Button>
                  </s.Action>
                </s.Actions>
              </s.ReviewOptions>
            </>
          ) : null}

          {flow.step === 'processing' ? (
            <s.Progress>
              <Spinner
                size={theme.control.height.md}
                color={theme.colors.primary}
              />

              <s.Title style={ss.Heading(theme)}>
                {t('diary.cloud.download.downloading')}
              </s.Title>

              <s.ProgressText style={ss.Body(theme)}>
                {t('diary.cloud.download.progress', {
                  current: transfer.processedEntries,

                  total: transfer.totalEntries,
                })}
              </s.ProgressText>

              <s.Description style={ss.Body(theme)}>
                {t('diary.cloud.download.processingDescription')}
              </s.Description>
            </s.Progress>
          ) : null}

          {flow.step === 'result' && flow.result !== null ? (
            <>
              <s.Header>
                <s.Title style={ss.Heading(theme)}>
                  {t('diary.cloud.download.complete')}
                </s.Title>
              </s.Header>

              <s.ResultGrid>
                <s.ResultItem>
                  <s.ResultLabel style={ss.Body(theme)}>
                    {t('diary.cloud.download.result.added')}
                  </s.ResultLabel>

                  <s.ResultValue style={ss.Subheading(theme)}>
                    {flow.result.added}
                  </s.ResultValue>
                </s.ResultItem>

                <s.ResultItem>
                  <s.ResultLabel style={ss.Body(theme)}>
                    {t('diary.cloud.download.result.replaced')}
                  </s.ResultLabel>

                  <s.ResultValue style={ss.Subheading(theme)}>
                    {flow.result.replaced}
                  </s.ResultValue>
                </s.ResultItem>

                <s.ResultItem>
                  <s.ResultLabel style={ss.Body(theme)}>
                    {t('diary.cloud.download.result.skipped')}
                  </s.ResultLabel>

                  <s.ResultValue style={ss.Subheading(theme)}>
                    {flow.result.skipped}
                  </s.ResultValue>
                </s.ResultItem>

                <s.ResultItem>
                  <s.ResultLabel style={ss.Body(theme)}>
                    {t('diary.cloud.download.result.failed')}
                  </s.ResultLabel>

                  <s.ResultValue style={ss.Subheading(theme)}>
                    {flow.result.failed}
                  </s.ResultValue>
                </s.ResultItem>
              </s.ResultGrid>

              <s.ResultDescription style={ss.Body(theme)}>
                {t('diary.cloud.download.result.description')}
              </s.ResultDescription>

              <s.Done>
                <Button
                  style={ss.FullWidth}
                  accessibilityLabel={t('diary.cloud.download.done')}
                  onPress={handleDone}
                >
                  <s.ButtonText style={ss.Text(theme)}>
                    {t('diary.cloud.download.done')}
                  </s.ButtonText>
                </Button>
              </s.Done>
            </>
          ) : null}
        </s.Root>
      </PortalModal>

      <CloudDiaryPhotoViewer
        entry={cloudPhotoEntry}
        onClose={closeCloudPhoto}
      />

      <DiaryPhotoViewer entry={localPhotoEntry} onClose={closeLocalPhoto} />
    </>
  );
};
