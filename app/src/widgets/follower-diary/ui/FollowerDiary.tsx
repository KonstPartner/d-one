import { useMemo } from 'react';
import styled from '@emotion/native';
import { useTranslation } from 'react-i18next';

import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import * as ss from '@shared/styles';
import { Loader, LoadingView } from '@shared/ui';

import { useFollowerDiaryProfile } from '../model/useFollowerDiaryProfile';
import { useFollowerDiaryRefresh } from '../model/useFollowerDiaryRefresh';

import { FollowerDiaryContent } from './FollowerDiaryContent';

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
    <State>
      <StateTitle>{t('diary.follower.unassigned.title')}</StateTitle>

      <StateDescription>
        {t('diary.follower.unassigned.description')}
      </StateDescription>
    </State>
  );
};

const FollowerDiaryInner = () => {
  const followerProfile = useFollowerDiaryProfile();

  const diaryRefresh = useFollowerDiaryRefresh({
    userId: followerProfile.userId,

    currentOwnerUid: followerProfile.followedUserId,
  });

  if (followerProfile.hasInitialError) {
    throw followerProfile.error ?? new Error('custom/user-profile-load-failed');
  }

  if (followerProfile.isInitialLoading) {
    return <LoadingView />;
  }

  if (followerProfile.followedUserId === null) {
    return (
      <UnassignedState
        refreshing={diaryRefresh.isRefreshing}
        onRefresh={diaryRefresh.refresh}
      />
    );
  }

  return (
    <FollowerDiaryContent
      key={`${followerProfile.followedUserId}:${diaryRefresh.contentRevision}`}
      ownerUid={followerProfile.followedUserId}
      refreshing={diaryRefresh.isRefreshing}
      onRefresh={diaryRefresh.refresh}
    />
  );
};

export const FollowerDiary = () => (
  <Loader errorType="firebase">
    <FollowerDiaryInner />
  </Loader>
);

const State = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

const StateTitle = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};

  text-align: center;
`;

const StateDescription = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;
