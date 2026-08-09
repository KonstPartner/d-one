import { useQuery } from '@tanstack/react-query';

import { FollowerDiary } from '@widgets/follower-diary';
import { OwnerDiary } from '@widgets/owner-diary';
import { useSession } from '@entities/session';
import { userProfileQueryOptions, UserRole } from '@entities/user';
import { PlatformOS } from '@shared/lib/platform';
import { Loader, LoadingView, PageLayout } from '@shared/ui';

import * as s from '../styles/DiaryPage';

const DiaryContent = () => {
  const { sessionUser, isSessionReady } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery(userProfileQueryOptions(userId));

  const isLoading =
    !isSessionReady || (sessionUser !== null && profileQuery.isPending);

  if (isLoading) {
    return <LoadingView />;
  }

  const profile = profileQuery.data;

  if (!profile) {
    return null;
  }

  if (profile.role === UserRole.User) {
    if (PlatformOS.WEB) {
      return (
        <s.UnsupportedContent>
          <s.UnsupportedTitle>
            diary.unsupportedPlatform.title
          </s.UnsupportedTitle>

          <s.UnsupportedDescription>
            diary.unsupportedPlatform.description
          </s.UnsupportedDescription>
        </s.UnsupportedContent>
      );
    }

    return <OwnerDiary />;
  }

  if (profile.role === UserRole.Follower) {
    return <FollowerDiary followedUserId={profile.followedUserId} />;
  }

  return null;
};

export const DiaryPage = () => {
  return (
    <PageLayout>
      <Loader errorType="none">
        <DiaryContent />
      </Loader>
    </PageLayout>
  );
};
