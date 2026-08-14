import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { OwnerCloudDiary } from '@widgets/owner-cloud-diary';
import { PlatformOS } from '@shared/lib/platform';
import * as ss from '@shared/styles';
import { PageLayout } from '@shared/ui';

import * as s from '../styles/CloudPage';

const CloudContent = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  if (PlatformOS.WEB) {
    return (
      <s.UnsupportedContent>
        <s.UnsupportedTitle style={ss.Heading(theme)}>
          {t('diary.unsupportedPlatform.title')}
        </s.UnsupportedTitle>

        <s.UnsupportedDescription style={ss.Body(theme)}>
          {t('diary.unsupportedPlatform.description')}
        </s.UnsupportedDescription>
      </s.UnsupportedContent>
    );
  }

  return <OwnerCloudDiary />;
};

export const CloudPage = () => {
  return (
    <PageLayout>
      <CloudContent />
    </PageLayout>
  );
};
