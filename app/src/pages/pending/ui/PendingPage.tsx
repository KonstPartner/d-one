import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '@shared/ui';

import * as s from '../styles/PendingPage';

export const PendingPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <s.Content>
        <s.Card>
          <s.Icon>
            <Ionicons
              name="time-outline"
              size={theme.control.height.sm}
              color={theme.colors.primary}
            />
          </s.Icon>

          <s.TextContent>
            <s.Title>{t('diary.pending.title')}</s.Title>

            <s.Description>{t('diary.pending.description')}</s.Description>
          </s.TextContent>
        </s.Card>
      </s.Content>
    </PageLayout>
  );
};
