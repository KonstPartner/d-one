import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type CloudDiaryEntry,
  CloudDiaryList,
  CloudDiaryPhotoViewer,
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

  const [photoViewerEntry, setPhotoViewerEntry] =
    useState<CloudDiaryEntry | null>(null);

  const showCloudError = useCallback((error: unknown) => {
    showNotification('error', errorMapper(error, 'cloud'));
  }, []);

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
      {diary.selection.selectionMode ? (
        <OwnerCloudDiarySelectionToolbar
          selectedCount={diary.selection.selectedCount}
          allSelected={diary.selection.allSelected}
          onToggleAll={diary.selection.toggleAll}
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
