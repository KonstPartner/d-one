import { useEffect, useMemo } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { FollowerDiaryHelp } from '@features/screen-help';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import { useCollapsibleToolbarVisibility } from '@shared/lib/react';
import { Loader, LoadingView } from '@shared/ui';

import { useFollowerDiaryProfile } from '../model/useFollowerDiaryProfile';
import { useFollowerDiaryRefresh } from '../model/useFollowerDiaryRefresh';
import { useFollowerDiaryUsers } from '../model/useFollowerDiaryUsers';
import * as s from '../styles/FollowerDiary';

import { FollowerDiaryContent } from './FollowerDiaryContent';
import { FollowerUserSelector } from './FollowerUserSelector';

type UnassignedStateProps = {
  refreshing: boolean;

  onRefresh: () => void | Promise<void>;
};

const UnassignedState = ({
  refreshing,

  onRefresh,
}: UnassignedStateProps) => {
  const { t } = useTranslation();

  const headerMenuItems = useMemo<HeaderMenuItem[]>(
    () => [
      {
        key: 'follower-diary-refresh',

        labelKey: 'diary.follower.menu.refresh',

        icon: 'refresh-outline',

        disabled: refreshing,

        onPress: () => {
          void onRefresh();
        },
      },
    ],
    [onRefresh, refreshing]
  );

  useHeaderMenu(headerMenuItems);

  return (
    <s.State>
      <s.StateTitle>{t('diary.follower.unassigned.title')}</s.StateTitle>

      <s.StateDescription>
        {t('diary.follower.unassigned.description')}
      </s.StateDescription>
    </s.State>
  );
};

const FollowerDiaryInner = () => {
  const theme = useTheme();

  const followerProfile = useFollowerDiaryProfile();

  const followerUsers = useFollowerDiaryUsers(followerProfile.followedUserIds);

  const toolbar = useCollapsibleToolbarVisibility();

  const diaryRefresh = useFollowerDiaryRefresh({
    userId: followerProfile.userId,

    currentOwnerUid: followerUsers.ownerUid,
  });

  const selectorOverlayStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',

      top: 0,
      left: 0,
      right: 0,

      zIndex: 10,

      paddingBottom: theme.spacing.md,

      backgroundColor: theme.colors.bg,
    }),
    [theme.colors.bg, theme.spacing.md]
  );

  useEffect(() => {
    toolbar.showToolbar();
  }, [followerUsers.ownerUid, followerUsers.showSelector, toolbar.showToolbar]);

  if (followerProfile.hasInitialError) {
    throw followerProfile.error ?? new Error('custom/user-profile-load-failed');
  }

  if (followerProfile.isInitialLoading) {
    return <LoadingView />;
  }

  if (followerUsers.selectorError !== null) {
    throw followerUsers.selectorError;
  }

  return (
    <>
      <FollowerDiaryHelp />

      {followerUsers.ownerUid === null ? (
        <UnassignedState
          refreshing={diaryRefresh.isRefreshing}
          onRefresh={diaryRefresh.refresh}
        />
      ) : (
        <s.Content>
          <s.Diary>
            <FollowerDiaryContent
              key={`${followerUsers.ownerUid}:${diaryRefresh.contentRevision}`}
              ownerUid={followerUsers.ownerUid}
              refreshing={diaryRefresh.isRefreshing}
              onRefresh={diaryRefresh.refresh}
              contentContainerStyle={
                followerUsers.showSelector
                  ? toolbar.listContentContainerStyle
                  : undefined
              }
              onScroll={
                followerUsers.showSelector ? toolbar.handleScroll : undefined
              }
              onScrollBeginDrag={
                followerUsers.showSelector
                  ? toolbar.handleScrollBeginDrag
                  : undefined
              }
              onScrollEndDrag={
                followerUsers.showSelector
                  ? toolbar.handleScrollEndDrag
                  : undefined
              }
            />
          </s.Diary>

          {followerUsers.showSelector ? (
            <Animated.View
              onLayout={toolbar.handleToolbarLayout}
              style={[selectorOverlayStyle, toolbar.toolbarAnimatedStyle]}
            >
              <s.Selector>
                <FollowerUserSelector
                  users={followerUsers.users}
                  selectedOwnerUid={followerUsers.ownerUid}
                  loading={followerUsers.selectorLoading}
                  onSelect={followerUsers.selectOwner}
                />
              </s.Selector>
            </Animated.View>
          ) : null}
        </s.Content>
      )}
    </>
  );
};

export const FollowerDiary = () => (
  <Loader errorType="firebase">
    <FollowerDiaryInner />
  </Loader>
);
