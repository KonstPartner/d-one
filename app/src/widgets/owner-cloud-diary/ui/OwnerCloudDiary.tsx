import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CloudDiaryDownloadModal,
  useCloudDiaryDownloadFlow,
} from '@features/download-cloud-diary-entries';
import { OwnerCloudDiaryHelp } from '@features/screen-help';
import {
  type CloudDiaryEntry,
  CloudDiaryList,
  CloudDiaryPhotoViewer,
  useDiaryTransferState,
} from '@entities/diary';
import { useSession } from '@entities/session';
import { errorMapper } from '@shared/lib/errors';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import { showNotification } from '@shared/lib/notifications';
import { Loader, LoadingView } from '@shared/ui';

import { useOwnerCloudDiary } from '../model/useOwnerCloudDiary';

import { OwnerCloudDiarySelectionToolbar } from './OwnerCloudDiarySelectionToolbar';

type OwnerCloudDiaryContentProps = {
  ownerUid: string;
};

const OwnerCloudDiaryContent = ({ ownerUid }: OwnerCloudDiaryContentProps) => {
  const { t } = useTranslation();

  const diary = useOwnerCloudDiary({
    ownerUid,
  });

  const download = useCloudDiaryDownloadFlow();

  const transfer = useDiaryTransferState();

  const transferLocked =
    transfer.phase === 'waitingForSync' ||
    transfer.phase === 'validating' ||
    transfer.phase === 'resolvingConflicts' ||
    transfer.phase === 'processing';

  const downloadActive = download.step !== 'idle' && download.step !== 'result';

  const [photoViewerEntry, setPhotoViewerEntry] =
    useState<CloudDiaryEntry | null>(null);

  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const showCloudError = useCallback((error: unknown) => {
    showNotification('error', errorMapper(error, 'cloud'));
  }, []);

  const showDownloadError = useCallback(
    (error: unknown) => {
      console.error('Failed to download cloud diary entries', error);

      showNotification('error', t('diary.cloud.download.failed'));
    },
    [t]
  );

  const handleOpenPhoto = useCallback(
    (entry: CloudDiaryEntry) => {
      if (diary.selection.selectionMode) {
        return;
      }

      setPhotoViewerEntry(entry);
    },
    [diary.selection.selectionMode]
  );

  const handleClosePhoto = useCallback(() => {
    setPhotoViewerEntry(null);
  }, []);

  const handlePrevious = useCallback(() => {
    diary.goPrevious();
  }, [diary.goPrevious]);

  const handleNext = useCallback(() => {
    void diary.goNext().catch(showCloudError);
  }, [diary.goNext, showCloudError]);

  const handleRefresh = useCallback(() => {
    setPhotoViewerEntry(null);

    void diary.refreshFirstPage().catch(showCloudError);
  }, [diary.refreshFirstPage, showCloudError]);

  const handlePullRefresh = useCallback(async (): Promise<void> => {
    if (isPullRefreshing || diary.isLoading) {
      return;
    }

    setPhotoViewerEntry(null);
    setIsPullRefreshing(true);

    try {
      await diary.refreshFirstPage();
    } catch (error: unknown) {
      showCloudError(error);
    } finally {
      setIsPullRefreshing(false);
    }
  }, [
    diary.isLoading,
    diary.refreshFirstPage,
    isPullRefreshing,
    showCloudError,
  ]);

  const handleDownload = useCallback(() => {
    if (
      diary.selection.selectedEntries.length === 0 ||
      download.step !== 'idle' ||
      transferLocked
    ) {
      return;
    }

    setPhotoViewerEntry(null);

    void download
      .start(diary.selection.selectedEntries)
      .catch(showDownloadError);
  }, [
    diary.selection.selectedEntries,
    download.start,
    download.step,
    showDownloadError,
    transferLocked,
  ]);

  const handleDownloadDone = useCallback(() => {
    diary.selection.exitSelection();
  }, [diary.selection.exitSelection]);

  useEffect(() => {
    if (download.step !== 'result') {
      return;
    }

    diary.selection.exitSelection();
  }, [diary.selection.exitSelection, download.step]);

  const headerMenuItems = useMemo<HeaderMenuItem[]>(
    () =>
      diary.selection.selectionMode
        ? []
        : [
            {
              key: 'owner-cloud-refresh',

              labelKey: 'diary.cloud.menu.refresh',

              icon: 'refresh-outline',

              disabled: diary.isLoading,

              onPress: handleRefresh,
            },

            {
              key: 'owner-cloud-select',

              labelKey: 'diary.cloud.menu.selectEntries',

              icon: 'checkbox-outline',

              disabled: !diary.selection.canEnterSelection || diary.isLoading,

              onPress: diary.selection.enterSelection,
            },
          ],
    [
      diary.isLoading,

      diary.selection.canEnterSelection,

      diary.selection.enterSelection,

      diary.selection.selectionMode,

      handleRefresh,
    ]
  );

  useHeaderMenu(headerMenuItems);

  if (diary.hasInitialError) {
    throw diary.error ?? new Error('UNKNOWN_ERROR');
  }

  if (diary.isInitialLoading) {
    return <LoadingView />;
  }

  return (
    <>
      <OwnerCloudDiaryHelp menuEnabled={!diary.selection.selectionMode} />

      {diary.selection.selectionMode ? (
        <OwnerCloudDiarySelectionToolbar
          selectedCount={diary.selection.selectedCount}
          allSelected={diary.selection.allSelected}
          downloadDisabled={
            diary.selection.selectedCount === 0 ||
            transferLocked ||
            downloadActive
          }
          downloading={download.isChecking || download.isProcessing}
          onToggleAll={diary.selection.toggleAll}
          onDownload={handleDownload}
          onClose={diary.selection.exitSelection}
        />
      ) : null}

      <CloudDiaryList
        list={diary}
        emptyTitle={t('diary.cloud.empty.title')}
        emptyDescription={t('diary.cloud.empty.description')}
        previousLabel={t('diary.pagination.previousPage')}
        nextLabel={t('diary.pagination.nextPage')}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenPhoto={handleOpenPhoto}
        refreshing={isPullRefreshing}
        onRefresh={() => {
          void handlePullRefresh();
        }}
        selection={
          diary.selection.selectionMode
            ? {
                isEntrySelected: diary.selection.isEntrySelected,

                onToggleEntry: diary.selection.toggleEntry,
              }
            : undefined
        }
      />

      <CloudDiaryPhotoViewer
        entry={photoViewerEntry}
        onClose={handleClosePhoto}
      />

      <CloudDiaryDownloadModal
        flow={download}
        onDone={handleDownloadDone}
        onError={showDownloadError}
      />
    </>
  );
};

const OwnerCloudDiaryInner = () => {
  const { sessionUser, isSessionReady } = useSession();

  if (!isSessionReady || sessionUser === null) {
    return <LoadingView />;
  }

  return <OwnerCloudDiaryContent ownerUid={sessionUser.uid} />;
};

export const OwnerCloudDiary = () => (
  <Loader errorType="cloud">
    <OwnerCloudDiaryInner />
  </Loader>
);
