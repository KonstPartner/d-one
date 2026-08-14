import { useTranslation } from 'react-i18next';

import { OwnerDiary } from '@widgets/owner-diary';
import { PlatformOS } from '@shared/lib/platform';
import { Loader, PageLayout } from '@shared/ui';

import * as s from '../styles/DiaryPage';

const DiaryContent = () => {
  const { t } = useTranslation();

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
