import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { OwnerDiary } from '@widgets/owner-diary';
import { useSession } from '@entities/session';
import { userProfileQueryOptions, UserRole } from '@entities/user';
import { PlatformOS } from '@shared/lib/platform';
import { Loader, LoadingView, PageLayout } from '@shared/ui';

import * as s from '../styles/DiaryPage';

const DiaryContent = () => {
  const { t } = useTranslation();

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
            {t('diary.unsupportedPlatform.title')}
          </s.UnsupportedTitle>

          <s.UnsupportedDescription>
            {t('diary.unsupportedPlatform.description')}
          </s.UnsupportedDescription>
        </s.UnsupportedContent>
      );
    }

    return <OwnerDiary />;
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
