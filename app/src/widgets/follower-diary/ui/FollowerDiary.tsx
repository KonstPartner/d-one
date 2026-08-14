import { useCallback, useMemo } from 'react';
import styled from '@emotion/native';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@shared/lib/errors';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';
import { showNotification } from '@shared/lib/notifications';
import * as ss from '@shared/styles';
import { Loader, LoadingView } from '@shared/ui';

import { useFollowerDiaryProfile } from '../model/useFollowerDiaryProfile';

import { FollowerDiaryContent } from './FollowerDiaryContent';

type UnassignedStateProps = {
  refreshing: boolean;

  onRefresh: () => void;
};

const UnassignedState = ({ refreshing, onRefresh }: UnassignedStateProps) => {
  const { t } = useTranslation();

  const headerMenuItems = useMemo<HeaderMenuItem[]>(
    () => [
      {
        key: 'follower-diary-refresh',

        labelKey: 'diary.follower.menu.refresh',

        icon: 'refresh-outline',

        disabled: refreshing,

        onPress: onRefresh,
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

  if (followerProfile.hasInitialError) {
    throw followerProfile.error ?? new Error('custom/user-profile-load-failed');
  }

  const handleRefreshProfile = useCallback(() => {
    void followerProfile.refreshProfile().catch((error) => {
      showNotification('error', errorMapper(error, 'firebase'));
    });
  }, [followerProfile.refreshProfile]);

  if (followerProfile.isInitialLoading) {
    return <LoadingView />;
  }

  if (followerProfile.followedUserId === null) {
    return (
      <UnassignedState
        refreshing={followerProfile.isRefreshing}
        onRefresh={handleRefreshProfile}
      />
    );
  }

  return (
    <FollowerDiaryContent
      ownerUid={followerProfile.followedUserId}
      refreshProfile={followerProfile.refreshProfile}
    />
  );
};

export const FollowerDiary = () => (
  <Root>
    <Loader errorType="firebase">
      <FollowerDiaryInner />
    </Loader>
  </Root>
);

const Root = styled.View`
  flex: 1;

  background-color: ${({ theme }) => theme.colors.bg};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

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
