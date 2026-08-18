import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScrollViewProps } from 'react-native';

import {
  type CloudDiaryEntry,
  CloudDiaryList,
  CloudDiaryPhotoViewer,
  useCloudDiaryList,
} from '@entities/diary';
import { errorMapper } from '@shared/lib/errors';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import { showNotification } from '@shared/lib/notifications';
import { Loader, LoadingView } from '@shared/ui';

type FollowerDiaryContentProps = {
  ownerUid: string;

  refreshing: boolean;

  onRefresh: () => void | Promise<void>;

  refreshProgressViewOffset?: number;

  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];

  onScroll?: ScrollViewProps['onScroll'];

  onScrollBeginDrag?: ScrollViewProps['onScrollBeginDrag'];

  onScrollEndDrag?: ScrollViewProps['onScrollEndDrag'];
};

const FollowerDiaryContentInner = ({
  ownerUid,

  refreshing,

  onRefresh,

  refreshProgressViewOffset,

  contentContainerStyle,

  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
}: FollowerDiaryContentProps) => {
  const { t } = useTranslation();

  const list = useCloudDiaryList({
    ownerUid,
  });

  const [photoViewerEntry, setPhotoViewerEntry] =
    useState<CloudDiaryEntry | null>(null);

  const showCloudError = useCallback((error: unknown) => {
    showNotification('error', errorMapper(error, 'cloud'));
  }, []);

  const handleOpenPhoto = useCallback((entry: CloudDiaryEntry) => {
    setPhotoViewerEntry(entry);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setPhotoViewerEntry(null);
  }, []);

  const handlePrevious = useCallback(() => {
    list.goPrevious();
  }, [list.goPrevious]);

  const handleNext = useCallback(() => {
    void list.goNext().catch(showCloudError);
  }, [list.goNext, showCloudError]);

  const handlePullRefresh = useCallback(() => {
    setPhotoViewerEntry(null);

    void onRefresh();
  }, [onRefresh]);

  const headerMenuItems = useMemo<HeaderMenuItem[]>(
    () => [
      {
        key: 'follower-diary-refresh',

        labelKey: 'diary.follower.menu.refresh',

        icon: 'refresh-outline',

        disabled: refreshing || list.isLoading,

        onPress: () => {
          void onRefresh();
        },
      },
    ],
    [list.isLoading, onRefresh, refreshing]
  );

  useHeaderMenu(headerMenuItems);

  if (list.hasInitialError) {
    throw list.error ?? new Error('UNKNOWN_ERROR');
  }

  if (list.isInitialLoading) {
    return <LoadingView />;
  }

  return (
    <>
      <CloudDiaryList
        list={list}
        emptyTitle={t('diary.follower.empty.title')}
        emptyDescription={t('diary.follower.empty.description')}
        previousLabel={t('diary.pagination.previousPage')}
        nextLabel={t('diary.pagination.nextPage')}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenPhoto={handleOpenPhoto}
        refreshing={refreshing}
        onRefresh={handlePullRefresh}
        refreshProgressViewOffset={refreshProgressViewOffset}
        contentContainerStyle={contentContainerStyle}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />

      <CloudDiaryPhotoViewer
        entry={photoViewerEntry}
        onClose={handleClosePhoto}
      />
    </>
  );
};

export const FollowerDiaryContent = (props: FollowerDiaryContentProps) => (
  <Loader errorType="cloud">
    <FollowerDiaryContentInner {...props} />
  </Loader>
);
