import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type CloudDiaryEntry, CloudDiaryPhotoViewer } from '@entities/diary';
import type { UserProfile } from '@entities/user';
import { errorMapper } from '@shared/lib/errors';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import { showNotification } from '@shared/lib/notifications';
import { Loader, LoadingView } from '@shared/ui';

import { useFollowerDiaryList } from '../model/useFollowerDiaryList';

import { FollowerDiaryList } from './FollowerDiaryList';

type FollowerDiaryContentProps = {
  ownerUid: string;

  refreshProfile: () => Promise<UserProfile>;
};

const FollowerDiaryContentInner = ({
  ownerUid,
  refreshProfile,
}: FollowerDiaryContentProps) => {
  const { t } = useTranslation();

  const list = useFollowerDiaryList(ownerUid);

  const refreshInProgressRef = useRef(false);

  const [refreshing, setRefreshing] = useState(false);

  const [photoViewerEntry, setPhotoViewerEntry] =
    useState<CloudDiaryEntry | null>(null);

  if (list.hasInitialError) {
    throw list.error ?? new Error('UNKNOWN_ERROR');
  }

  const showCloudError = useCallback((error: unknown) => {
    showNotification('error', errorMapper(error, 'cloud'));
  }, []);

  const showProfileError = useCallback((error: unknown) => {
    showNotification('error', errorMapper(error, 'firebase'));
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

  const handleRefresh = useCallback(async () => {
    if (refreshInProgressRef.current) {
      return;
    }

    refreshInProgressRef.current = true;

    setRefreshing(true);

    try {
      let nextProfile: UserProfile;

      try {
        nextProfile = await refreshProfile();
      } catch (error) {
        showProfileError(error);

        return;
      }

      if (nextProfile.followedUserId !== ownerUid) {
        return;
      }

      try {
        await list.refreshFirstPage();
      } catch (error) {
        showCloudError(error);
      }
    } finally {
      refreshInProgressRef.current = false;

      setRefreshing(false);
    }
  }, [
    list.refreshFirstPage,
    ownerUid,
    refreshProfile,
    showCloudError,
    showProfileError,
  ]);

  const headerMenuItems = useMemo<HeaderMenuItem[]>(
    () => [
      {
        key: 'follower-diary-refresh',

        labelKey: 'diary.follower.menu.refresh',

        icon: 'refresh-outline',

        disabled: refreshing || list.isLoading,

        onPress: () => {
          void handleRefresh();
        },
      },
    ],
    [handleRefresh, list.isLoading, refreshing]
  );

  useHeaderMenu(headerMenuItems);

  if (list.isInitialLoading) {
    return <LoadingView />;
  }

  return (
    <>
      <FollowerDiaryList
        list={list}
        emptyTitle={t('diary.follower.empty.title')}
        emptyDescription={t('diary.follower.empty.description')}
        previousLabel={t('diary.pagination.previousPage')}
        nextLabel={t('diary.pagination.nextPage')}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenPhoto={handleOpenPhoto}
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
